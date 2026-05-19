import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = formData.get("email")?.toString()?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL("/subscribe?error=invalid_email", req.url), 303);
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("newsletter_subscribers").upsert({ email, is_active: true }, { onConflict: "email" });

  return NextResponse.redirect(new URL("/subscribe?newsletter=joined", req.url), 303);
}
