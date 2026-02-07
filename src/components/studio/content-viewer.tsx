"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download, ChevronLeft, ChevronRight,
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
  const isGenerating = output.generation_status === "generating";

  const progress = (output.content as Record<string, unknown>)?.progress as
    { completed?: number; total?: number; phase?: string; failed?: number } | undefined;

  const handleDownload = async () => {
    if (images.length === 0) return;
    const url = images[isSlides ? currentSlide : 0];
    const link = document.createElement("a");
    link.href = url;
    link.download = `${output.title}-${currentSlide + 1}.png`;
    link.click();
  };

  // Clamp currentSlide to valid range for available images
  const safeSlide = Math.min(currentSlide, Math.max(0, images.length - 1));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-4 py-3 pr-12 border-b border-border-default space-y-0">
          <DialogTitle className="text-sm font-semibold text-text-primary truncate">
            {output.title}
          </DialogTitle>
          {images.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-1" />
              다운로드
            </Button>
          )}
        </DialogHeader>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[400px] bg-gray-50 p-4">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Progress section */}
              <div className="text-center w-full max-w-xs mx-auto">
                <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-medium text-text-primary mb-1">
                  {progress?.phase || "준비 중"}...
                </p>
                {progress && progress.total ? (
                  <>
                    <p className="text-sm text-text-secondary mb-3">
                      {progress.completed || 0}/{progress.total} 슬라이드 생성 완료
                    </p>
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-brand h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(((progress.completed || 0) / progress.total) * 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {Math.round(((progress.completed || 0) / progress.total) * 100)}%
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-text-secondary">생성 중...</p>
                )}
              </div>

              {/* Show completed slides preview during generation */}
              {images.length > 0 && (
                <div className="relative w-full mt-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images[safeSlide]}
                    alt={`슬라이드 ${safeSlide + 1}`}
                    className="max-w-full max-h-[40vh] object-contain rounded-lg"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                        disabled={safeSlide === 0}
                        className="absolute left-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setCurrentSlide((prev) => Math.min(images.length - 1, prev + 1))}
                        disabled={safeSlide === images.length - 1}
                        className="absolute right-2 p-2 bg-white/80 rounded-full shadow hover:bg-white disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              )}
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
        {((isSlides && !isGenerating) || (isGenerating && images.length > 1)) && (
          <div className="flex items-center justify-center gap-2 py-3 border-t border-border-default">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                  i === (isGenerating ? safeSlide : currentSlide) ? "bg-brand" : "bg-gray-300"
                }`}
              />
            ))}
            <span className="text-xs text-text-muted ml-2">
              {(isGenerating ? safeSlide : currentSlide) + 1} / {images.length}
              {isGenerating && progress?.total ? ` (총 ${progress.total}장)` : ""}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
