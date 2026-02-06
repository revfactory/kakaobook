"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ArrowLeft, LogOut } from "lucide-react";
import Link from "next/link";

interface SettingsClientProps {
  user: {
    display_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export function SettingsClient({ user }: SettingsClientProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = (user.display_name || user.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-14 border-b border-border-default flex items-center px-4 gap-3">
        <Link
          href="/home"
          className="p-1.5 rounded-md hover:bg-gray-50 text-text-tertiary"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand rounded flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-text-primary">
            설정
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[640px] mx-auto px-6 py-8">
        {/* Profile */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            프로필
          </h2>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="text-lg bg-brand-light text-brand">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-base font-medium text-text-primary">
                {user.display_name}
              </p>
              <p className="text-sm text-text-tertiary">{user.email}</p>
            </div>
          </div>
        </section>

        <Separator />

        {/* Account */}
        <section className="my-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            계정
          </h2>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="text-error border-error/30 hover:bg-error/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </section>
      </main>
    </div>
  );
}
