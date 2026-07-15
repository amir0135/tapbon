#!/usr/bin/env python3
"""
Tapbon Bridge emulator — a laptop pretending to be a receipt printer.

Fase 2 of specs/printer-emulation.md. Implements Phase 0(+0b TXT records) of
docs/pos-test-plan.md: listens on TCP 9100 for raw ESC/POS, announces itself
via mDNS/Bonjour as an Epson TM-m30II, renders each print job visually to PNG
and uploads it to the Tapbon bridge API. Failed uploads queue locally and
retry. The POS never sees an error (bytes are always accepted; DLE EOT status
requests get an "online, paper OK" answer).

Usage:
  python3 emulator.py --token tb_...            # against https://tapbon.dk
  python3 emulator.py --token tb_... --api http://localhost:3000
  TAPBON_DEVICE_TOKEN=tb_... python3 emulator.py --no-mdns

Reference (never dependencies): escpos-tools, escpresso, escpos-printer-db.
"""

import argparse
import hashlib
import json
import os
import socket
import socketserver
import sys
import threading
import time
from pathlib import Path

import requests
from PIL import Image, ImageDraw, ImageFont

# ── ESC/POS constants ────────────────────────────────────────────────────────
ESC, GS, FS, DLE, LF, CR = 0x1B, 0x1D, 0x1C, 0x10, 0x0A, 0x0D

# Fixed parameter lengths for common ESC/POS commands we skip over.
# (command byte after ESC/GS/FS -> number of parameter bytes)
ESC_PARAMS = {
    0x40: 0,   # ESC @ init
    0x21: 1,   # ESC ! print mode
    0x45: 1,   # ESC E bold
    0x2D: 1,   # ESC - underline
    0x61: 1,   # ESC a justify
    0x64: 1,   # ESC d feed n lines
    0x4A: 1,   # ESC J feed n dots
    0x74: 1,   # ESC t code page
    0x52: 1,   # ESC R charset
    0x33: 1,   # ESC 3 line spacing
    0x32: 0,   # ESC 2 default spacing
    0x70: 3,   # ESC p cash drawer
    0x4D: 1,   # ESC M font
    0x7B: 1,   # ESC { upside down
    0x47: 1,   # ESC G double strike
    0x20: 1,   # ESC SP char spacing
}
GS_PARAMS = {
    0x21: 1,   # GS ! char size
    0x42: 1,   # GS B reverse
    0x61: 1,   # GS a auto status back
    0x48: 1,   # GS H HRI position
    0x66: 1,   # GS f HRI font
    0x68: 1,   # GS h barcode height
    0x77: 1,   # GS w barcode width
    0x4C: 2,   # GS L left margin
    0x57: 2,   # GS W print width
}


def parse_escpos(data: bytes) -> list[str]:
    """Best-effort visual decode: text lines out, commands/bitmaps skipped."""
    lines: list[str] = []
    buf = bytearray()
    i, n = 0, len(data)

    def flush():
        text = buf.decode("cp865", errors="replace").rstrip()
        lines.append(text)
        buf.clear()

    while i < n:
        b = data[i]
        if b == LF:
            flush(); i += 1
        elif b == CR:
            i += 1
        elif b == ESC and i + 1 < n:
            c = data[i + 1]
            if c == 0x2A and i + 4 < n:  # ESC * bit image: m nL nH data
                m, nl, nh = data[i + 2], data[i + 3], data[i + 4]
                width = nl + nh * 256
                bytes_per_col = 3 if m in (32, 33) else 1
                i += 5 + width * bytes_per_col
            else:
                i += 2 + ESC_PARAMS.get(c, 0)
        elif b == GS and i + 1 < n:
            c = data[i + 1]
            if c == 0x56:  # GS V cut — job content ends here
                if buf: flush()
                # GS V m n ('A'/'B' variants carry a feed byte), else GS V m
                i += 4 if i + 2 < n and data[i + 2] in (0x41, 0x42) else 3
            elif c == 0x76 and i + 7 < n:  # GS v 0 raster bitmap
                xl, xh, yl, yh = data[i + 4:i + 8]
                i += 8 + (xl + xh * 256) * (yl + yh * 256)
                lines.append("[logo]")
            elif c == 0x6B:  # GS k barcode (NUL-terminated or length-prefixed)
                if i + 2 < n and data[i + 2] <= 6:  # system A: NUL-terminated
                    j = data.index(b"\x00", i + 3) if b"\x00" in data[i + 3:] else n - 1
                    i = j + 1
                else:  # system B: length byte
                    i += 4 + (data[i + 3] if i + 3 < n else 0)
                lines.append("[stregkode]")
            elif c == 0x28 and i + 4 < n:  # GS ( x: pL pH payload (QR etc.)
                pl, ph = data[i + 3], data[i + 4]
                i += 5 + pl + ph * 256
            else:
                i += 2 + GS_PARAMS.get(c, 0)
        elif b == FS and i + 1 < n:
            i += 2
        elif b == DLE and i + 1 < n:
            i += 2  # realtime requests answered at socket level
        elif b in (0x00, 0x07, 0x0C, 0x18):
            i += 1
        else:
            buf.append(b); i += 1
    if buf:
        flush()
    while lines and not lines[-1]:
        lines.pop()
    return lines


# ── PNG rendering ────────────────────────────────────────────────────────────
FONT_CANDIDATES = [
    "/Users/Amira/Library/Fonts/JetBrainsMono-Regular.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Monaco.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
]


def load_font(size: int = 20):
    for path in FONT_CANDIDATES:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def render_png(lines: list[str], width: int = 576) -> bytes:
    font = load_font()
    pad, line_h = 24, 26
    height = pad * 2 + max(1, len(lines)) * line_h
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    for idx, line in enumerate(lines):
        draw.text((pad, pad + idx * line_h), line, fill=(35, 43, 56), font=font)
    from io import BytesIO
    out = BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


# ── Upload with offline queue ────────────────────────────────────────────────
class Uploader:
    def __init__(self, api: str, token: str, queue_dir: Path):
        self.url = f"{api.rstrip('/')}/api/bridge/receipts"
        self.token = token
        self.queue_dir = queue_dir
        queue_dir.mkdir(parents=True, exist_ok=True)
        threading.Thread(target=self._retry_loop, daemon=True).start()

    def upload(self, png: bytes, print_job_id: str) -> bool:
        try:
            resp = requests.post(
                self.url,
                headers={"Authorization": f"Bearer {self.token}"},
                files={"file": ("receipt.png", png, "image/png")},
                data={"printJobId": print_job_id},
                timeout=30,
            )
            if resp.ok:
                body = resp.json()
                print(f"[upload] kvittering klar — kode {body.get('confirmationCode')} "
                      f"({body.get('receiptUrl')})")
                return True
            print(f"[upload] afvist: HTTP {resp.status_code} {resp.text[:200]}")
            # 4xx = permanent (bad token/format) — queueing won't help
            return resp.status_code < 500
        except requests.RequestException as err:
            print(f"[upload] netfejl: {err}")
            return False

    def submit(self, png: bytes, print_job_id: str):
        if not self.upload(png, print_job_id):
            path = self.queue_dir / f"{print_job_id}.png"
            path.write_bytes(png)
            print(f"[kø] gemt til retry: {path.name}")

    def _retry_loop(self):
        while True:
            time.sleep(30)
            for path in sorted(self.queue_dir.glob("*.png")):
                print(f"[kø] retry {path.name}")
                if self.upload(path.read_bytes(), path.stem):
                    path.unlink()


# ── TCP 9100 print server ────────────────────────────────────────────────────
JOB_IDLE_SECONDS = 2.0


class PrintHandler(socketserver.BaseRequestHandler):
    def handle(self):
        print(f"[9100] forbindelse fra {self.client_address[0]}")
        self.request.settimeout(JOB_IDLE_SECONDS)
        job = bytearray()
        while True:
            try:
                chunk = self.request.recv(4096)
            except socket.timeout:
                if job:
                    self._finish(job)
                    job = bytearray()
                continue
            except OSError:
                break
            if not chunk:
                break
            # Answer DLE EOT realtime status: "online, paper OK".
            if DLE in chunk and b"\x10\x04" in bytes(chunk):
                try:
                    self.request.sendall(b"\x12")
                except OSError:
                    pass
            job.extend(chunk)
            # GS V (cut) marks end-of-receipt on most POS systems.
            if b"\x1dV" in bytes(job):
                self._finish(job)
                job = bytearray()
        if job:
            self._finish(job)
        print("[9100] forbindelse lukket")

    def _finish(self, job: bytearray):
        data = bytes(job)
        job_id = hashlib.sha256(data).hexdigest()[:16]
        lines = parse_escpos(data)
        print(f"[job {job_id}] {len(data)} bytes → {len(lines)} linjer")
        for line in lines[:6]:
            print(f"    | {line}")
        png = render_png(lines)
        server: "PrintServer" = self.server  # type: ignore[assignment]
        server.uploader.submit(png, job_id)


class PrintServer(socketserver.ThreadingTCPServer):
    allow_reuse_address = True

    def __init__(self, addr, uploader: Uploader):
        super().__init__(addr, PrintHandler)
        self.uploader = uploader


# ── mDNS announcement (Epson TM-m30II lookalike) ─────────────────────────────
def announce_mdns(port: int, name: str):
    from zeroconf import Zeroconf, ServiceInfo

    ip = "127.0.0.1"
    try:  # a routable local IP; hostname lookup is unreliable on macOS
        probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        probe.connect(("8.8.8.8", 80))
        ip = probe.getsockname()[0]
        probe.close()
    except OSError:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except OSError:
            pass

    txt = {
        "txtvers": "1",
        "ty": "EPSON TM-m30II",
        "usb_MFG": "EPSON",
        "usb_MDL": "TM-m30II",
        "product": "(EPSON TM-m30II)",
        "pdl": "application/octet-stream",
        "note": "Tapbon",
    }
    zc = Zeroconf()
    services = []
    for stype in ("_printer._tcp.local.", "_pdl-datastream._tcp.local.", "_ipp._tcp.local."):
        info = ServiceInfo(
            stype,
            f"{name}.{stype}",
            addresses=[socket.inet_aton(ip)],
            port=port,
            properties=txt,
            server=f"{name.replace(' ', '-')}.local.",
        )
        zc.register_service(info)
        services.append(info)
    print(f"[mdns] annonceret som '{name}' (EPSON TM-m30II) på {ip}:{port}")
    return zc, services


# ── main ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Tapbon Bridge printer-emulator")
    ap.add_argument("--api", default=os.environ.get("TAPBON_API", "https://tapbon.dk"))
    ap.add_argument("--token", default=os.environ.get("TAPBON_DEVICE_TOKEN"))
    ap.add_argument("--port", type=int, default=9100)
    ap.add_argument("--name", default="Digital kvittering (Tapbon)")
    ap.add_argument("--no-mdns", action="store_true", help="skip Bonjour announcement")
    args = ap.parse_args()

    if not args.token:
        sys.exit("Angiv enheds-nøgle: --token tb_... eller TAPBON_DEVICE_TOKEN")

    uploader = Uploader(args.api, args.token, Path(__file__).parent / "queue")
    zc = None
    if not args.no_mdns:
        try:
            zc, _ = announce_mdns(args.port, args.name)
        except Exception as err:  # mDNS is best-effort; 9100 still works by IP
            print(f"[mdns] kunne ikke annoncere ({err}) — fortsætter uden")

    server = PrintServer(("0.0.0.0", args.port), uploader)
    print(f"[9100] lytter på port {args.port} — vælg printeren i POS'en (eller tilføj via IP)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if zc:
            zc.close()
        server.server_close()


if __name__ == "__main__":
    main()
