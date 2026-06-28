import { Skeleton } from '@/components/ui/skeleton';

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:flex-row">
      {/* PDF Viewer skeleton */}
      <div className="hidden h-full flex-col border-r md:flex md:w-1/2">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="flex-1 rounded-none" />
      </div>

      {/* Chat skeleton */}
      <div className="flex h-full flex-col md:w-1/2">
        <div className="flex h-14 items-center border-b px-4">
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex-1 space-y-4 p-4">
          <Skeleton className="h-16 w-3/4 rounded-lg" />
          <Skeleton className="h-20 w-1/2 rounded-lg ml-auto" />
          <Skeleton className="h-16 w-2/3 rounded-lg" />
        </div>
        <div className="border-t p-4">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
