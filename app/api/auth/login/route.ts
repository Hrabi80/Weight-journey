import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const body = await req.json().catch(() => null);

  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Invalid credentials." }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: { id: data.user.id, email: data.user.email },
      session: {
        access_token: data.session?.access_token,
        expires_at: data.session?.expires_at,
      },
    },
    { status: 200 },
  );
}

