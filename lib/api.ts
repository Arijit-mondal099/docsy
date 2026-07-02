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
  plan: string;
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

// ── Chat types ──

export type ChatListItem = {
  id: string;
  documentId: string;
  documentName: string | null;
  name: string | null;
  createdAt: string;
  lastMessage: string | null;
  messageCount: number;
};

export async function fetchChats(): Promise<ChatListItem[]> {
  const res = await fetch('/api/chats');
  if (!res.ok) throw new Error('Failed to fetch chats');
  return res.json();
}

export async function deleteChat(id: string): Promise<void> {
  const res = await fetch(`/api/chats/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete chat');
}

export async function renameChat(id: string, name: string): Promise<void> {
  const res = await fetch(`/api/chats/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to rename chat');
}

// ── Payment types ──

export type PlanId = 'free' | 'pro_monthly' | 'pro_yearly';

export type Plan = {
  id: PlanId;
  name: string;
  description: string;
  price: number;
  currency: 'INR' | 'USD';
  period: 'month' | 'year' | 'none';
  features: string[];
  limits: {
    documentLimit: number;
    messageLimit: number;
  };
  badge?: string;
  cta: string;
};

export type Subscription = {
  id: string;
  plan: PlanId;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'paused';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

export type Payment = {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySubscriptionId: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: PlanId | null;
  description: string | null;
  createdAt: string;
};

export type PaymentHistoryResponse = {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ── Payment API functions ──

export async function createPaymentOrder(planId: PlanId): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}> {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create payment order');
  }

  return res.json();
}

export async function verifyPayment(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planId: PlanId;
}): Promise<{ success: boolean; subscription?: Subscription }> {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Payment verification failed');
  }

  return res.json();
}

export async function fetchSubscription(): Promise<Subscription | null> {
  const res = await fetch('/api/payments/subscription');
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch subscription');
  }
  const data = await res.json();
  return data?.subscription ?? null;
}

export async function cancelSubscription(): Promise<{ success: boolean }> {
  const res = await fetch('/api/payments/subscription', {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to cancel subscription');
  return res.json();
}

export async function fetchPaymentHistory(page = 1, limit = 10): Promise<PaymentHistoryResponse> {
  const res = await fetch(`/api/payments/history?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch payment history');
  return res.json();
}
