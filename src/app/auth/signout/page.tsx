"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmailAndPassword } from "@/server/auth";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { toast } from "sonner";

export default function LoginPage() {
  const supabase = createSupabaseBrowserClient();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
    </div>
  );
}
