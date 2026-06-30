'use client';

import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, RotateCw, Download } from 'lucide-react';

interface PdfToolbarProps {
  documentName?: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
  onRotate: () => void;
  pdfUrl: string;
}

export function PdfToolbar({
  documentName,
  zoom,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onRotate,
  pdfUrl,
}: PdfToolbarProps) {
  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b bg-muted/30 px-3">
      <span className="truncate text-xs font-medium text-muted-foreground">
        {documentName || 'Document'}
      </span>
      <div className="flex items-center gap-0.5">
        <span className="mr-1 text-xs tabular-nums text-muted-foreground/70">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon-xs" onClick={onZoomOut} title="Zoom out">
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={onZoomIn} title="Zoom in">
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <div className="mx-1 h-4 w-px bg-border" />
        <Button variant="ghost" size="icon-xs" onClick={onRotate} title="Rotate">
          <RotateCw className="h-3.5 w-3.5" />
        </Button>
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
          <Button variant="ghost" size="icon-xs" title="Download">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </a>
        <Button variant="ghost" size="icon-xs" onClick={onFullscreen} title="Fullscreen">
          <Maximize className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
