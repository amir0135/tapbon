import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { merchantLogos } from '@/lib/db/schema';

// Streamer forretningens logo (offentligt — vises på kvitteringssiden).

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const merchantId = Number(id);
  if (!Number.isInteger(merchantId) || merchantId <= 0) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  const rows = await db
    .select()
    .from(merchantLogos)
    .where(eq(merchantLogos.merchantId, merchantId))
    .limit(1);
  const logo = rows[0];
  if (!logo) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  return new NextResponse(new Uint8Array(logo.data), {
    headers: {
      'Content-Type': logo.mimeType,
      'Content-Length': String(logo.byteSize),
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
