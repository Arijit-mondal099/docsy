export type Document = {
  id: string;
  userId: string;
  name: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  pageCount: number | null;
  createdAt: string;
};

export async function fetchDocuments(): Promise<Document[]> {
  const res = await fetch('/api/documents');
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Upload failed');
  }

  return res.json();
}