'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchDocuments, deleteDocument, type Document } from '@/lib/api';
import { UploadDropzone } from '@/components/pdf/upload-dropzone';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusBadge = (status: Document['status']) => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[status] || 'bg-gray-100 text-gray-800'
      }`}
    >
      {status}
    </span>
  );
};

export default function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: docs, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      toast.success('Document deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });

  const handleChat = async (documentId: string) => {
    const res = await fetch('/api/chats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/chat/${id}`);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'Failed to start chat');
    }
  };

  const handleRetry = async (doc: Document) => {
    // Re-trigger processing by calling upload again with the same doc
    // For now, show a notice — re-processing is handled in Phase 5
    toast.info('Re-processing will be available in a future update');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your PDF documents</p>
      </div>

      <UploadDropzone />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Documents</h2>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!isLoading && docs && docs.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <p className="text-sm text-muted-foreground">
                No documents yet. Upload your first PDF above.
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading &&
          docs &&
          docs.map((doc) => (
            <Card key={doc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg
                      className="h-8 w-8 shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <div className="truncate">
                      <CardTitle className="text-base truncate">{doc.name}</CardTitle>
                      <CardDescription>
                        Uploaded{' '}
                        {formatDistanceToNow(new Date(doc.createdAt), {
                          addSuffix: true,
                        })}
                        {doc.pageCount ? ` · ${doc.pageCount} pages` : ''}
                      </CardDescription>
                    </div>
                  </div>
                  {statusBadge(doc.status)}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {doc.status === 'ready' && (
                    <Button variant="default" size="sm" onClick={() => handleChat(doc.id)}>
                      <svg
                        className="mr-1.5 h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                        />
                      </svg>
                      Chat
                    </Button>
                  )}

                  {doc.status === 'error' && (
                    <Button variant="outline" size="sm" onClick={() => handleRetry(doc)}>
                      <svg
                        className="mr-1.5 h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
                        />
                      </svg>
                      Retry
                    </Button>
                  )}

                  {doc.status === 'processing' && (
                    <span className="text-xs text-muted-foreground">Processing...</span>
                  )}

                  <div className="ml-auto">
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            disabled={doc.status === 'processing'}
                          />
                        }
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                        <span className="sr-only">Delete</span>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete document?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{' '}
                            <strong className="font-medium">{doc.name}</strong> and remove it from
                            Cloudinary and the vector database. Your chat history for this document
                            will also be deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate(doc.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
      </div>
    </div>
  );
}
