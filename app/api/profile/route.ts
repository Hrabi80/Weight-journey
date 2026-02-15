import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { ZodError } from "zod";
import {
  EmailAlreadyExistsError,
  EmptyProfileUpdateError,
  ProfileAlreadyExistsForAuthUserError,
  ProfileNotFoundForAuthUserError,
} from "@/src/application/errors/profile.errors";
import { make_profile_use_cases } from "@/src/infrastructure/DI/profile.di";
import type { Profile } from "@/src/domaine/entities/profile.entity";


function map_profile(profile: Profile) {
  return {
    id: profile.id,
    email: profile.email,
    authUserId: profile.auth_user_id,
    age: profile.age,
    height: profile.height,
    initialWeight: profile.initial_weight,
    createdAt: profile.created_at,
  };
}

async function get_authenticated_user(
  supabase: SupabaseClient
): Promise<User | null> {
  const { data: auth, error } = await supabase.auth.getUser();
  if (error || !auth.user) {
    return null;
  }

  return auth.user;
}




export async function POST(req: Request) {
  const { create_profile, supabase } = await make_profile_use_cases();
  const body = await req.json();

  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }
    const { data: auth, error: auth_error } = await supabase.auth.getUser();
    console.log("🚀 ~ POST ~ auth_error:", auth_error)
    console.log("🚀 ~ POST ~ auth:", auth)
  if (auth_error || !auth.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
try {
  console.log("come here 1 ....")
    const result = await create_profile.execute({
      email: body.email ?? auth.user.email ?? "",
      authUserId: auth.user.id,
      age: body.age,
      height: body.height,
      initialWeight: body.initialWeight,
    });
    console.log("🚀 ~ POST ~ result:", result)

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.log("🚀 ~ POST ~ error:", error)
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

export async function GET() {
  const { get_profile_by_auth_user, supabase } = await make_profile_use_cases();
  const auth_user = await get_authenticated_user(supabase);

  if (!auth_user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await get_profile_by_auth_user.execute({
      authUserId: auth_user.id,
    });

    return NextResponse.json({ profile: map_profile(profile) }, { status: 200 });
  } catch (error) {
    if (error instanceof ProfileNotFoundForAuthUserError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

   

    console.error("[GET /api/profile] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { update_profile, supabase } = await make_profile_use_cases();
  const auth_user = await get_authenticated_user(supabase);

  if (!auth_user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  try {
    const profile = await update_profile.execute({
      authUserId: auth_user.id,
      email: String(body.email)?.toLowerCase(),
      age: Number(body.age),
      height: Number(body.height),
      initialWeight:
        Number(body.initialWeight) ?? Number(body.weight),
    });

    return NextResponse.json({ profile: map_profile(profile) }, { status: 200 });
  } catch (error) {
    if (
      error instanceof EmptyProfileUpdateError ||
      error instanceof ZodError
    ) {
      return NextResponse.json(
        {
          message:
            error instanceof EmptyProfileUpdateError
              ? error.message
              : "Validation failed.",
          issues: error instanceof ZodError ? (error) : undefined,
        },
        { status: 400 }
      );
    }

    if (error instanceof ProfileNotFoundForAuthUserError) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("[PATCH /api/profile] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
