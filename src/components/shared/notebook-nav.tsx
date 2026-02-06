"use client";

import { BookOpen, Share2, Settings, Plus } from "lucide-react";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface NotebookNavProps {
  user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  notebookTitle: string;
  onTitleChange: (title: string) => void;
  onShare?: () => void;
}

export function NotebookNav({
  user,
  notebookTitle,
  onTitleChange,
  onShare,
}: NotebookNavProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(notebookTitle);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(notebookTitle);
  }, [notebookTitle]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (title.trim() && title !== notebookTitle) {
      onTitleChange(title.trim());
    } else {
      setTitle(notebookTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setTitle(notebookTitle);
      setIsEditing(false);
    }
  };

  return (
    <header className="h-12 border-b border-border-default bg-white flex items-center px-4 gap-3">
      {/* Logo */}
      <Link
        href="/"
        className="w-6 h-6 bg-brand rounded flex items-center justify-center hover:bg-brand-hover transition-colors"
      >
        <BookOpen className="w-3.5 h-3.5 text-white" />
      </Link>

      {/* Title */}
      {isEditing ? (
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-[15px] font-semibold text-text-primary border border-border-focus rounded px-2 py-0.5 outline-none"
          maxLength={200}
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="text-[15px] font-semibold text-text-primary hover:text-brand transition-colors cursor-pointer truncate max-w-[400px]"
        >
          {notebookTitle}
        </button>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-xs h-8 gap-1.5"
          asChild
        >
          <Link href="/">
            <Plus className="w-3.5 h-3.5" />
            노트북 만들기
          </Link>
        </Button>

        <button
          onClick={onShare}
          className="p-1.5 rounded-md hover:bg-gray-50 text-text-tertiary cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button className="p-1.5 rounded-md hover:bg-gray-50 text-text-tertiary cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
