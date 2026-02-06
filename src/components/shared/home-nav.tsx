"use client";

import { BookOpen, Grid3X3, List, Search } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomeNavProps {
  user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  activeTab: string;
  onTabChange: (tab: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onNewNotebook: () => void;
}

const tabs = [
  { id: "all", label: "전체" },
  { id: "mine", label: "내 노트북" },
  { id: "shared", label: "공유 검색함" },
];

export function HomeNav({
  user,
  activeTab,
  onTabChange,
  viewMode,
  onViewModeChange,
  onNewNotebook,
}: HomeNavProps) {
  return (
    <header className="h-14 border-b border-border-default bg-white flex items-center px-4 gap-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-4">
        <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
        <span className="text-lg font-bold text-text-primary">KakaoBook</span>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors cursor-pointer",
              activeTab === tab.id
                ? "text-brand font-medium bg-brand-faint"
                : "text-text-tertiary hover:text-text-primary hover:bg-gray-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-md hover:bg-gray-50 text-text-tertiary cursor-pointer">
          <Search className="w-5 h-5" />
        </button>

        <div className="flex items-center border border-border-default rounded-md">
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "p-1.5 rounded-l-md cursor-pointer",
              viewMode === "grid"
                ? "bg-gray-100 text-text-primary"
                : "text-text-muted hover:text-text-tertiary"
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "p-1.5 rounded-r-md cursor-pointer",
              viewMode === "list"
                ? "bg-gray-100 text-text-primary"
                : "text-text-muted hover:text-text-tertiary"
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <Button onClick={onNewNotebook} className="bg-brand hover:bg-brand-hover text-white text-sm h-9">
          새로 만들기
        </Button>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
