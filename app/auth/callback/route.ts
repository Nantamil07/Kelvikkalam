import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // OAuth error
  if (error) {
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Exchange OAuth code for session
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();

        // First time user → create empty profile row
        if (!existingProfile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            username: null,
            avatar_url:
              user.user_metadata?.avatar_url || null,
          });

          return NextResponse.redirect(
            `${origin}/setup-profile`
          );
        }

        // Existing user but no username yet
        if (!existingProfile.username) {
          return NextResponse.redirect(
            `${origin}/setup-profile`
          );
        }

        // Existing user with username
        return NextResponse.redirect(origin);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
