"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  X, Download, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { StudioOutput } from "@/lib/supabase/types";

interface ContentViewerProps {
  output: StudioOutput;
  onClose: () => void;
}

export function ContentViewer({ output, onClose }: ContentViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = output.image_urls || [];

  const isSlides = output.type === "slide_deck" && images.length > 1;

  const handleDownload = async () => {
    if (images.length === 0) return;
    const url = images[isSlides ? currentSlide : 0];
    const link = document.createElement("a");
    link.href = url;
    link.download = `${output.title}-${currentSlide + 1}.png`;
    link.click();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
          <h3 className="text-sm font-semibold text-text-primary truncate">
            {output.title}
          </h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              다운로드
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex items-center justify-center min-h-[400px] bg-gray-50 p-4">
          {output.generation_status === "generating" ? (
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-text-secondary">생성 중...</p>
            </div>
          ) : output.generation_status === "failed" ? (
            <div className="text-center">
              <p className="text-sm text-error mb-2">생성에 실패했습니다.</p>
              <p className="text-xs text-text-muted">{output.error_message}</p>
            </div>
          ) : images.length > 0 ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[isSlides ? currentSlide : 0]}
                alt={output.title}
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />

              {/* Slide Navigation */}
              {isSlides && (
                <>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentSlide === 0}
                    className="absolute left-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentSlide((prev) =>
                        Math.min(images.length - 1, prev + 1)
                      )
                    }
                    disabled={currentSlide === images.length - 1}
                    className="absolute right-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-text-muted">
              콘텐츠가 없습니다.
            </p>
          )}
        </div>

        {/* Slide Indicators */}
        {isSlides && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border-default">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  i === currentSlide ? "bg-brand" : "bg-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-text-muted ml-2">
              {currentSlide + 1} / {images.length}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
