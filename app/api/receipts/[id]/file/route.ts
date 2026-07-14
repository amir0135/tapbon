import { NextResponse } from 'next/server';
import { getReceiptFile } from '@/lib/receipts/queries';

// Streams the captured print job (PNG/PDF) for a file receipt. Public by the
// same rule as /r/[id]: the receipt id is an unguessable UUID.

export const dynamic = 'force-dynamic';

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
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

  return new NextResponse(new Uint8Array(file.data), {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Length': String(file.byteSize),
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex',
    },
  });
}
