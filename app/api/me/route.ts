import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SupabaseProfileRepository } from "@/lib/infra/supabase/profile-repo";
import { SupabaseWeightRepository } from "@/lib/infra/supabase/weight-repo";
import { SupabaseWellnessRepository } from "@/lib/infra/supabase/wellness-repo";
import { GetDashboardDataUseCase } from "@/src/domaine/usecasesOld/get-dashboard-data";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileRepo = new SupabaseProfileRepository(supabase);
  const profile = await profileRepo.getByAuthUserId(user.id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const weightRepo = new SupabaseWeightRepository(supabase);
  const wellnessRepo = new SupabaseWellnessRepository(supabase);

  const usecase = new GetDashboardDataUseCase(profileRepo, weightRepo, wellnessRepo);
  const result = await usecase.execute(profile.email);

  return NextResponse.json(
    {
      user: { id: user.id, email: user.email },
      profile: result.profile,
      entries: result.weightEntries,
      wellnessEntries: result.wellnessEntries,
    },
    { status: 200 },
  );
}
