import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/auth/error", request.url));
  }

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Create profile after successful auth
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          username: (user.email?.split("@")[0] || "user") + Date.now(),
        }).select();
      }

      return NextResponse.redirect(new URL("/setup-profile", request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/error", request.url));
}
