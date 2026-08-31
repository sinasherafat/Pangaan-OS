"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signIn(input: z.input<typeof credentialsSchema>) {
  const credentials = credentialsSchema.safeParse(input);

  if (!credentials.success) {
    return { ok: false as const, message: "Enter a valid email and password." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(credentials.data);

    if (error) {
      return { ok: false as const, message: "Invalid email or password." };
    }

    return { ok: true as const };
  } catch {
    return { ok: false as const, message: "Authentication is temporarily unavailable." };
  }
}
