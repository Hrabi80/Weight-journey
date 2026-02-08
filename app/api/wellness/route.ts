import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseWellnessRepository } from "@/lib/infra/supabase/wellness-repo";
import { LogWellnessEntryUseCase } from "@/src/domaine/usecasesOld/log-wellness-entry";
import type { WellnessMetric } from "@/src/domaine/entities/wellness-entry.entity";
import { SupabaseProfileRepository } from "@/lib/infra/supabase/profile-repo";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await new SupabaseProfileRepository(supabase).getByAuthUserId(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const repo = new SupabaseWellnessRepository(supabase);
  const entries = await repo.list(profile.email);
  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const metric = body?.metric as WellnessMetric | undefined;
  const value = Number(body?.value);
  const date = (body?.date as string | undefined) ?? new Date().toISOString().split("T")[0];

  if (!metric || Number.isNaN(value)) {
    return NextResponse.json({ error: "metric and value are required." }, { status: 400 });
  }

  const profile = await new SupabaseProfileRepository(supabase).getByAuthUserId(user.id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const repo = new SupabaseWellnessRepository(supabase);
  const usecase = new LogWellnessEntryUseCase(repo);
  const entry = await usecase.execute({ email: profile.email, metric, value, date });

  return NextResponse.json({ entry }, { status: 201 });
}
