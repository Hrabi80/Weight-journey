import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseWeightRepository } from "@/lib/infra/supabase/weight-repo";
import { AddWeightEntryUseCase } from "@/src/domaine/usecases/add-weight-entry";
import { SupabaseProfileRepository } from "@/lib/infra/supabase/profile-repo";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await new SupabaseProfileRepository(supabase).getByAuthUserId(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const repo = new SupabaseWeightRepository(supabase);
  const entries = await repo.list(profile.username);
  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const weight = Number(body?.weight);
  const date = body?.date as string | undefined;

  if (!Number.isFinite(weight)) {
    return NextResponse.json({ error: "Weight is required" }, { status: 400 });
  }

  const profile = await new SupabaseProfileRepository(supabase).getByAuthUserId(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const repo = new SupabaseWeightRepository(supabase);
  const usecase = new AddWeightEntryUseCase(repo);
  const entry = await usecase.execute({ username: profile.username, weight, date });

  return NextResponse.json({ entry }, { status: 201 });
}
