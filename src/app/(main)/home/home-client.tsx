"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { HomeNav } from "@/components/shared/home-nav";
import { NotebookCard } from "@/components/notebook/notebook-card";
import { NewNotebookCard } from "@/components/notebook/new-notebook-card";
import {
  useNotebooks,
  useCreateNotebook,
  useDeleteNotebook,
  useUpdateNotebook,
} from "@/hooks/use-notebooks";

interface HomeClientProps {
  user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export function HomeClient({ user }: HomeClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: notebooks, isLoading } = useNotebooks();
  const createNotebook = useCreateNotebook();
  const deleteNotebook = useDeleteNotebook();
  const updateNotebook = useUpdateNotebook();

  const handleNewNotebook = async () => {
    try {
      const notebook = await createNotebook.mutateAsync(undefined);
      router.push(`/notebook/${notebook.id}`);
    } catch {
      toast.error("노트북 생성에 실패했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotebook.mutateAsync(id);
      toast.success("노트북이 삭제되었습니다.");
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      await updateNotebook.mutateAsync({ id, title });
    } catch {
      toast.error("이름 변경에 실패했습니다.");
    }
  };

  const filteredNotebooks = notebooks?.filter((nb) => {
    if (activeTab === "shared") return nb.is_shared;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      <HomeNav
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNewNotebook={handleNewNotebook}
      />

      <main className="max-w-[1280px] mx-auto px-6 py-6">
        <h2 className="text-xl font-semibold text-text-primary mb-6">
          최근 노트북
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl h-40 bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : !filteredNotebooks?.length ? (
          <div className="flex flex-col items-center justify-center mt-30">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-12 h-12 text-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-text-secondary">
              노트북을 만들어 시작하세요
            </h3>
            <p className="text-sm text-text-muted mt-2">
              소스를 추가하고 AI와 함께 학습하세요
            </p>
            <button
              onClick={handleNewNotebook}
              className="mt-6 px-6 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand-hover transition-colors cursor-pointer"
            >
              새 노트북 만들기
            </button>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
                : "flex flex-col gap-2"
            }
          >
            {viewMode === "grid" && (
              <NewNotebookCard onClick={handleNewNotebook} />
            )}
            {filteredNotebooks.map((notebook) =>
              viewMode === "grid" ? (
                <NotebookCard
                  key={notebook.id}
                  notebook={notebook}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ) : (
                <a
                  key={notebook.id}
                  href={`/notebook/${notebook.id}`}
                  className="flex items-center gap-3 h-12 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg">{notebook.emoji}</span>
                  <span className="text-sm font-medium text-text-primary flex-1 truncate">
                    {notebook.title}
                  </span>
                  <span className="text-xs text-text-muted">
                    소스 {notebook.source_count}개
                  </span>
                </a>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
