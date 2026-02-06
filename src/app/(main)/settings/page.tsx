import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const userInfo = {
    display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email || "",
    email: user.email || "",
    avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
  };

  return <SettingsClient user={userInfo} />;
}
