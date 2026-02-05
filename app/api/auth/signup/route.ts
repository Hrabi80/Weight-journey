import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProfileRepository } from "@/lib/infra/supabase/profile-repo";
import { SupabaseWeightRepository } from "@/lib/infra/supabase/weight-repo";
import { CreateUserProfileUseCase } from "@/src/domaine/usecases/create-user-profile";

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const body = await req.json().catch(() => null);

  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;
  const username = body?.username as string | undefined;
  const age = Number(body?.age);
  const height = Number(body?.height);
  const weight = Number(body?.weight);

  if (!email || !password || !username || Number.isNaN(age) || Number.isNaN(height) || Number.isNaN(weight)) {
    return NextResponse.json({ error: "Missing or invalid fields." }, { status: 400 });
  }

  const { data: signup, error: signupError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (signupError || !signup.user) {
    return NextResponse.json({ error: signupError?.message ?? "Sign up failed." }, { status: 400 });
  }

  const profileRepo = new SupabaseProfileRepository(supabase);
  const weightRepo = new SupabaseWeightRepository(supabase);
  const createProfile = new CreateUserProfileUseCase(profileRepo, weightRepo);

  try {
    const { profile, initialEntry } = await createProfile.execute({
      authUserId: signup.user.id,
      username,
      age,
      height,
      initialWeight: weight,
    });

    return NextResponse.json(
      {
        user: { id: signup.user.id, email: signup.user.email },
        profile,
        entries: [initialEntry],
      },
      { status: 201 },
    );
  } catch (error) {
    // Best effort cleanup if profile insert fails: delete the auth user using service role.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
      await admin.auth.admin.deleteUser(signup.user.id).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : "Could not create profile.";
    const status = message.toLowerCase().includes("username") ? 409 : 500;
    const friendly =
      status === 409 ? "Username already taken. Please choose another." : message;
    return NextResponse.json({ error: friendly }, { status });
  }
}
