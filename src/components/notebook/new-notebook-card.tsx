"use client";

import { Plus } from "lucide-react";

interface NewNotebookCardProps {
  onClick: () => void;
}

export function NewNotebookCard({ onClick }: NewNotebookCardProps) {
  return (
    <button
      onClick={onClick}
      className="border-2 border-dashed border-border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand hover:bg-brand-faint transition-colors"
    >
      <Plus className="w-10 h-10 text-text-muted" />
      <span className="text-sm text-text-tertiary">새 노트 만들기</span>
    </button>
  );
}
