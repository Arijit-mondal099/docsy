'use client';

import { useState, useRef, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { PdfToolbar } from './pdf-toolbar';
import { cn } from '@/lib/utils';

interface PdfViewerProps {
  url: string;
  documentName?: string;
  className?: string;
}

export function PdfViewer({ url, documentName, className }: PdfViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if ('webkitRequestFullscreen' in el) {
      (el as HTMLIFrameElement & { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    }
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  return (
    <div className={cn('flex flex-col', className)}>
      <PdfToolbar
        documentName={documentName}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
        onRotate={handleRotate}
        pdfUrl={url}
      />
      <div className="relative flex-1 overflow-hidden bg-muted/10">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-none" />
          </div>
        )}
        {error ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            Failed to load PDF preview. The document may have been removed or the URL has expired.
          </div>
        ) : (
          <div
            className="flex h-full w-full items-start justify-center overflow-auto"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          >
            <iframe
              ref={iframeRef}
              src={`${url}#zoom=${Math.round(zoom * 100)}`}
              className="h-full w-full"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center top',
                transition: 'transform 0.15s ease',
              }}
              title="PDF Viewer"
              onLoad={() => setLoaded(true)}
              onError={() => {
                setError(true);
                setLoaded(true);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
