import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { processPdf } from '@/lib/ai/embedding';
import { eq, and } from 'drizzle-orm';

export const maxDuration = 120; // 2 minutes for long-running processing

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  // Only allow retry on failed documents
  if (doc.status !== 'error') {
    return NextResponse.json(
      { error: 'Only failed documents can be reprocessed' },
      { status: 400 },
    );
  }

  try {
    // Mark as processing
    await db.update(documents).set({ status: 'processing' }).where(eq(documents.id, doc.id));

    // Process PDF (await so we know the result before responding)
    processPdf(doc.cloudinaryUrl, doc.id)
      .then(async (chunkCount) => {
        await db
          .update(documents)
          .set({ status: 'ready', pageCount: chunkCount })
          .where(eq(documents.id, doc.id));
      })
      .catch(async (error) => {
        console.error('Reprocess failed for document', doc.id, ':', error);
        await db.update(documents).set({ status: 'error' }).where(eq(documents.id, doc.id));
      });

    return NextResponse.json({ message: 'Reprocessing started' }, { status: 202 });
  } catch (error) {
    console.error('Reprocess initiation failed:', error);
    return NextResponse.json({ error: 'Failed to reprocess document' }, { status: 500 });
  }
}
