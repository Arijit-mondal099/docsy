export type DocumentStatus = 'pending' | 'processing' | 'ready' | 'error';

export type Document = {
  id: string;
  userId: string;
  name: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  status: DocumentStatus;
  pageCount: number | null;
  createdAt: string;
};

export type UsageStats = {
  documentsUploaded: number;
  messagesSent: number;
  resetDate: string;
  documentLimit: number;
  messageLimit: number;
};

export type DocumentBrief = {
  id: string;
  name: string;
  status: DocumentStatus;
  createdAt: string;
};

export type DashboardStats = UsageStats & {
  totalDocuments: number;
  readyDocuments: number;
  processingDocuments: number;
  pendingDocuments: number;
  errorDocuments: number;
  totalChats: number;
  totalMessages: number;
  usagePercentages: {
    documents: number;
    messages: number;
  };
  recentDocuments: DocumentBrief[];
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

export async function deleteDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete document');
  }
}

export async function reprocessDocument(id: string): Promise<void> {
  const res = await fetch(`/api/documents/${id}/reprocess`, {
    method: 'POST',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to reprocess document');
  }
}

export async function fetchUsage(): Promise<UsageStats> {
  const res = await fetch('/api/usage');
  if (!res.ok) throw new Error('Failed to fetch usage stats');
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/usage?dashboard=true');
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}
