import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/auth";

export default async function RootPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Authenticated users go to the home page (notebook list)
  redirect("/home");
}
