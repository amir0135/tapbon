import { NextResponse } from 'next/server';
import { getReceiptFile } from '@/lib/receipts/queries';

// Streams the captured print job (PNG/PDF) for a file receipt. Public by the
// same rule as /r/[id]: the receipt id is an unguessable UUID.

export const dynamic = 'force-dynamic';

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const extByMime: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!uuidRe.test(id)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const file = await getReceiptFile(id);
  if (!file) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const headers: Record<string, string> = {
    'Content-Type': file.mimeType,
    'Content-Length': String(file.byteSize),
    'Cache-Control': 'private, max-age=31536000, immutable',
    'X-Robots-Tag': 'noindex',
  };

  // ?download=1 → force a file download instead of inline display
  if (new URL(req.url).searchParams.has('download')) {
    const ext = extByMime[file.mimeType] ?? 'bin';
    headers['Content-Disposition'] =
      `attachment; filename="tapbon-bon-${id.slice(0, 8)}.${ext}"`;
  }

  return new NextResponse(new Uint8Array(file.data), { headers });
}
