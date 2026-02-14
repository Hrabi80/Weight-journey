import { NextResponse } from "next/server";
import { EmailAlreadyExistsError, ProfileAlreadyExistsForAuthUserError } from "@/src/application/errors/profile.errors";
import { make_profile_use_cases } from "@/src/infrastructure/DI/profile.di";

export async function POST(req: Request) {
  const { create_profile, supabase } = await make_profile_use_cases();

  // 1) Require auth user (session from cookies)
  const { data: auth, error: auth_error } = await supabase.auth.getUser();
  if (auth_error || !auth.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse body (age, height, initialWeight, email optional if you want)
  const body = await req.json();

  try {
    // You can choose to force email from auth.user.email to avoid mismatch.
    const result = await create_profile.execute({
      email: body.email ?? auth.user.email ?? "",
      authUserId: auth.user.id,
      age: body.age,
      height: body.height,
      initialWeight: body.initialWeight,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    if (error instanceof ProfileAlreadyExistsForAuthUserError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    // Zod validation errors will land here too (you can format them later)
    console.error("[POST /api/profile] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
