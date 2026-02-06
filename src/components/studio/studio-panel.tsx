"use client";

import { useState } from "react";
import {
  Headphones, Video, Brain, FileText, CreditCard, HelpCircle,
  BarChart3, Presentation, Table, Pencil, MoreVertical, Trash2,
  Loader2, StickyNote, Image,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudioOutputs, useDeleteStudioOutput } from "@/hooks/use-studio";
import { InfographicModal } from "./infographic-modal";
import { SlideModal } from "./slide-modal";
import { ContentViewer } from "./content-viewer";
import { toast } from "sonner";
import type { StudioOutput } from "@/lib/supabase/types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const STUDIO_TILES = [
  { type: "audio_overview", label: "AI 오디오 오버뷰", icon: Headphones, bg: "bg-card-sky", enabled: false },
  { type: "video_overview", label: "동영상 개요", icon: Video, bg: "bg-card-sky", enabled: false },
  { type: "mind_map", label: "마인드맵", icon: Brain, bg: "bg-card-rose", enabled: false },
  { type: "report", label: "보고서", icon: FileText, bg: "bg-card-rose", enabled: false },
  { type: "flashcard", label: "플래시카드", icon: CreditCard, bg: "bg-card-emerald", enabled: false },
  { type: "quiz", label: "퀴즈", icon: HelpCircle, bg: "bg-card-emerald", enabled: false },
  { type: "infographic", label: "인포그래픽", icon: BarChart3, bg: "bg-card-amber", enabled: true },
  { type: "slide_deck", label: "슬라이드 자료", icon: Presentation, bg: "bg-card-amber", enabled: true },
  { type: "data_table", label: "데이터 표", icon: Table, bg: "bg-blue-50", enabled: false, fullWidth: true },
] as const;

const OUTPUT_ICONS: Record<string, React.ReactNode> = {
  infographic: <BarChart3 className="w-4 h-4 text-amber-600" />,
  slide_deck: <Presentation className="w-4 h-4 text-amber-600" />,
  audio_overview: <Headphones className="w-4 h-4 text-blue-600" />,
  mind_map: <Brain className="w-4 h-4 text-purple-600" />,
  report: <FileText className="w-4 h-4 text-purple-600" />,
};

interface StudioPanelProps {
  notebookId: string;
}

export function StudioPanel({ notebookId }: StudioPanelProps) {
  const [showInfographicModal, setShowInfographicModal] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [viewingOutput, setViewingOutput] = useState<StudioOutput | null>(null);

  const { data: outputs = [] } = useStudioOutputs(notebookId);
  const deleteOutput = useDeleteStudioOutput();

  const handleTileClick = (type: string, enabled: boolean) => {
    if (!enabled) {
      toast.info("곧 출시 예정입니다.");
      return;
    }
    if (type === "infographic") setShowInfographicModal(true);
    if (type === "slide_deck") setShowSlideModal(true);
  };

  const handleDeleteOutput = async (id: string) => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;
    try {
      await deleteOutput.mutateAsync(id);
      toast.success("삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary">스튜디오</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {/* Tiles Grid */}
          <div className="grid grid-cols-2 gap-2">
            {STUDIO_TILES.map((tile) => {
              const Icon = tile.icon;
              return (
                <button
                  key={tile.type}
                  onClick={() => handleTileClick(tile.type, tile.enabled)}
                  className={`${tile.bg} ${
                    "fullWidth" in tile && tile.fullWidth ? "col-span-2" : ""
                  } rounded-lg px-3 py-2.5 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer group relative ${
                    !tile.enabled ? "opacity-60" : ""
                  }`}
                >
                  <Icon className="w-4 h-4 text-text-secondary shrink-0" />
                  <span className="text-xs font-medium text-text-secondary truncate">
                    {tile.label}
                  </span>
                  {tile.enabled && (
                    <Pencil className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Generated Content */}
          {outputs.length > 0 && (
            <>
              <div className="my-4 border-t border-border-default" />
              <div className="space-y-1">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-gray-50 group cursor-pointer"
                    onClick={() => setViewingOutput(output)}
                  >
                    {OUTPUT_ICONS[output.type] || (
                      <Image className="w-4 h-4 text-text-muted" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-text-primary truncate">
                        {output.title}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {output.source_ids?.length || 0}개 소스
                        {" · "}
                        {formatDistanceToNow(new Date(output.created_at), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>

                    {output.generation_status === "generating" ? (
                      <Loader2 className="w-4 h-4 text-brand animate-spin" />
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-100 cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5 text-text-muted" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteOutput(output.id);
                            }}
                            className="text-error cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Action */}
      <div className="p-3 border-t border-border-default">
        <button className="w-full h-10 flex items-center justify-center gap-2 bg-gray-50 border border-border-default rounded-lg text-[13px] text-text-secondary hover:bg-gray-100 transition-colors cursor-pointer">
          <StickyNote className="w-4 h-4" />
          메모 추가
        </button>
      </div>

      {/* Modals */}
      <InfographicModal
        open={showInfographicModal}
        onClose={() => setShowInfographicModal(false)}
        notebookId={notebookId}
      />
      <SlideModal
        open={showSlideModal}
        onClose={() => setShowSlideModal(false)}
        notebookId={notebookId}
      />

      {/* Content Viewer */}
      {viewingOutput && (
        <ContentViewer
          output={viewingOutput}
          onClose={() => setViewingOutput(null)}
        />
      )}
    </div>
  );
}
