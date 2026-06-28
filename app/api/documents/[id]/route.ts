import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { deletePdf } from '@/lib/cloudinary';
import { getPineconeIndex, getDocumentNamespace } from '@/lib/ai/pinecone';
import { eq, and } from 'drizzle-orm';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: _request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const doc = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, session.user.id)))
    .then((rows) => rows[0]);

  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  try {
    // Delete from Neon first (cascades to chats & messages)
    // This ensures user data is removed even if external cleanup fails
    await db.delete(documents).where(eq(documents.id, doc.id));

    // Attempt external cleanup best-effort
    const index = getPineconeIndex();
    const namespace = getDocumentNamespace(doc.id);
    try {
      await index.namespace(namespace).deleteAll();
    } catch (pineconeError) {
      console.error('Pinecone deletion failed (non-fatal):', pineconeError);
    }

    try {
      await deletePdf(doc.cloudinaryPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion failed (non-fatal):', cloudinaryError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Document deletion failed:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
