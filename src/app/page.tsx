import Link from "next/link";

import { HydrateClient } from "@/trpc/server";
import { readUserSession } from "@/server/auth";
import { Button } from "@/components/ui/button";
import SignOut from "./_components/sign-out";

export default async function Home() {
  const session = await readUserSession();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            LlamaDoc
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session.data.user && (
                  <span>Logged in as {session.data.user.email}</span>
                )}
              </p>
              <Button className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
                {session.data.user ? (
                  <SignOut />
                ) : (
                  <Link href="/auth/login">Sign in</Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
