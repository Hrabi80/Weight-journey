import { NextResponse } from "next/server";

import { make_auth_use_cases } from "@/src/infrastructure/di/auth.di";

/**
 * POST /api/auth/sign-out
 *
 * Clears the current auth session.
 */
export async function POST() {
  const { sign_out } = await make_auth_use_cases();

  try {
    await sign_out.execute();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[POST /api/auth/sign-out] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
