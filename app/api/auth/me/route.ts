import { NextResponse } from "next/server";

import { make_auth_use_cases } from "@/src/infrastructure/di/auth.di";

/**
 * GET /api/auth/me
 *
 * Returns `{ user: AuthUser | null }`.
 */
export async function GET() {
  const { get_current_user } = await make_auth_use_cases();

  try {
    const user = await get_current_user.execute();
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/auth/me] failed", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
