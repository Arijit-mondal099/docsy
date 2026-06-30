import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: _request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Find the document and verify ownership
  const doc = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (!doc.cloudinaryUrl) {
    return NextResponse.json({ error: 'Document URL not available' }, { status: 404 });
  }

  try {
    // Fetch PDF from Cloudinary server-side with 15s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const cloudinaryResponse = await fetch(doc.cloudinaryUrl, { signal: controller.signal });

      if (!cloudinaryResponse.ok) {
        console.error('Cloudinary fetch failed:', cloudinaryResponse.status, doc.cloudinaryUrl);
        return NextResponse.json(
          { error: 'Failed to fetch document from storage' },
          { status: 502 },
        );
      }

      // Validate Cloudinary returned actual PDF binary, not an HTML preview.
      // Cloudinary serves raw uploads as application/octet-stream, so both are valid.
      const cloudinaryContentType = cloudinaryResponse.headers.get('content-type') || '';
      if (cloudinaryContentType.includes('text/html')) {
        console.error(
          'Cloudinary returned HTML (old document format):',
          cloudinaryContentType,
          doc.cloudinaryUrl,
        );
        return NextResponse.json(
          {
            error:
              'Document URL is invalid. This may be an older document that needs to be re-uploaded.',
          },
          { status: 502 },
        );
      }

      // Stream the PDF back with correct headers for inline display
      return new Response(cloudinaryResponse.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${doc.name}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Cloudinary fetch timed out:', doc.cloudinaryUrl);
      return NextResponse.json(
        { error: 'Document storage did not respond in time. Please try again.' },
        { status: 504 },
      );
    }
    console.error('PDF proxy failed:', error);
    return NextResponse.json({ error: 'Failed to serve document' }, { status: 500 });
  }
}
