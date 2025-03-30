"use server";

import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/server/db/index";

import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function readUserSession() {
  noStore();
  const supabase = await createSupabaseServerClient();
  return supabase.auth.getUser();
}
export type SupabaseSession = Awaited<ReturnType<typeof readUserSession>>;

export async function signInWithEmailAndPassword(
  data: {
    email: string;
    password: string;
  },
  redirectURL: string | null,
): Promise<string | undefined> {
  const supabase = await createSupabaseServerClient();

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, data.email),
  });
  if (!user) {
    console.error("User not found:", data.email);
    return "There was an error authenticating your account.";
  }

  const { error } = await supabase.auth.signInWithPassword({
    ...data,
  });

  if (error) {
    return error.message;
  }

  return redirect(redirectURL ?? "/dashboard");
}

export async function signOut() {
  const session = await readUserSession();
  if (!session.data.user) {
    throw new Error("You must be signed in to perform this action");
  }

  const supabase = await createSupabaseServerClient();
  await Promise.all([supabase.auth.signOut()]);

  return redirect("/");
}
