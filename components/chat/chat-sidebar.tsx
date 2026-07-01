'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchChats, deleteChat, renameChat, type ChatListItem } from '@/lib/api';
import { MessageSquare, Plus, Trash2, Pencil, Check, X, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  currentChatId?: string;
  onNavClick?: () => void;
}

export function ChatSidebar({ currentChatId, onNavClick }: ChatSidebarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
    refetchInterval: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameChat(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setEditingId(null);
    },
  });

  const handleStartEdit = (chat: ChatListItem) => {
    setEditingId(chat.id);
    setEditName(chat.name || '');
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameMutation.mutate({ id: editingId, name: editName.trim() });
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeletingId(null);
    // If we're on the deleted chat, redirect to dashboard
    if (id === currentChatId) {
      router.push('/dashboard');
    }
  };

  const handleNewChat = () => {
    router.push('/documents');
  };

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button variant="ghost" size="icon-xs" onClick={handleNewChat} title="New chat">
          <Plus className="h-4 w-4" />
          <span className="sr-only">New chat</span>
        </Button>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && chats && chats.length === 0 && (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Upload a document and start chatting
            </p>
          </div>
        )}

        {!isLoading &&
          chats &&
          chats.map((chat) => {
            const isActive = chat.id === currentChatId;
            const isEditing = editingId === chat.id;

            return (
              <div key={chat.id} className="group relative">
                {isEditing ? (
                  <div className="flex items-center gap-1 rounded-lg border p-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="h-7 text-xs flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleSaveEdit}
                      disabled={!editName.trim()}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={`/chat/${chat.id}`}
                    onClick={onNavClick}
                    data-active={isActive || undefined}
                    className={cn(
                      'flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate text-sm font-medium">
                        {chat.name || 'Untitled Chat'}
                      </span>
                      {/* Actions — visible on hover */}
                      <div
                        className={cn(
                          'hidden group-hover:flex items-center gap-0.5 shrink-0 ml-2',
                          isActive && 'flex',
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleStartEdit(chat);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
                          title="Rename"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingId(chat.id);
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                      <span className="flex items-center gap-1 min-w-0">
                        <FileText className="h-3 w-3 shrink-0" />
                        <span className="truncate">{chat.documentName || 'Document'}</span>
                      </span>
                      <span>·</span>
                      <span className="shrink-0">
                        {formatDistanceToNow(new Date(chat.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {chat.lastMessage && (
                      <p className="mt-0.5 text-xs text-muted-foreground/60 line-clamp-1">
                        {chat.lastMessage}
                      </p>
                    )}
                  </Link>
                )}
              </div>
            );
          })}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this chat and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
