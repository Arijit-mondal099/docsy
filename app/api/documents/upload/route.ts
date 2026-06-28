import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { documents } from '@/lib/db/schema';
import { uploadPdf } from '@/lib/cloudinary';
import { processPdf } from '@/lib/ai/embedding';
import { checkDocumentUploadAllowed, incrementDocumentsUploaded } from '@/lib/db/usage';
import { eq } from 'drizzle-orm';

export const maxDuration = 120; // 2 minutes for long-running uploads

export async function POST(request: NextRequest) {
  // Validate session
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check usage limit
  const { allowed, reason } = await checkDocumentUploadAllowed(session.user.id);
  if (!allowed) {
    return NextResponse.json({ error: reason }, { status: 429 });
  }

  // Parse form data
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate MIME type
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
  }

  // Validate size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
  }

  try {
    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, publicId } = await uploadPdf(buffer, file.name);

    // Create document record
    const [doc] = await db
      .insert(documents)
      .values({
        userId: session.user.id,
        name: file.name,
        cloudinaryUrl: url,
        cloudinaryPublicId: publicId,
        status: 'processing',
      })
      .returning();

    // Process PDF in background (don't await)
    processPdf(url, doc.id)
      .then(async (chunkCount) => {
        await db
          .update(documents)
          .set({ status: 'ready', pageCount: chunkCount })
          .where(eq(documents.id, doc.id));
        // Only count toward usage limit after successful processing
        await incrementDocumentsUploaded(session.user.id);
      })
      .catch(async (error) => {
        console.error('PDF processing failed:', error);
        try {
          await db.update(documents).set({ status: 'error' }).where(eq(documents.id, doc.id));
        } catch (updateError) {
          console.error('Failed to update document status:', updateError);
        }
      });

    return NextResponse.json(
      {
        id: doc.id,
        name: doc.name,
        status: 'processing',
        createdAt: doc.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
