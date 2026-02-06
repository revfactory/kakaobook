import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NotebookClient } from "./notebook-client";
import type { Notebook } from "@/lib/supabase/types";

export default async function NotebookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: notebook, error } = await supabase
    .from("notebooks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !notebook) {
    redirect("/home");
  }

  const userInfo = {
    display_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "",
    email: user.email || "",
    avatar_url:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
  };

  return (
    <NotebookClient
      notebook={notebook as Notebook}
      user={userInfo}
    />
  );
}
