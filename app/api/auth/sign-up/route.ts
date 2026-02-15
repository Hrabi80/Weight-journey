import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { AuthEmailAlreadyInUseError } from "@/src/application/errors/auth.errors";
import { make_auth_use_cases } from "@/src/infrastructure/di/auth.di";

/**
 * POST /api/auth/sign-up
 *
 * Creates a new auth user and starts a session.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as unknown;
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const { sign_up } = await make_auth_use_cases();

  try {
    const auth_user = await sign_up.execute(body);
    return NextResponse.json(auth_user, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Validation failed.", issues: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof AuthEmailAlreadyInUseError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    console.error("[POST /api/auth/sign-up] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
