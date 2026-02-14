import { CreateProfileUseCase } from "@/src/application/useCases/profileUseCases/create-profile.usecase";
import { SupabaseProfileRepository } from "../repositories/supabase-profile.repository";
import { create_supabase_server_client } from "../supabase/server-client";
import { GetProfileByAuthUserUseCase } from "@/src/application/useCases/profileUseCases/get-profile-by-auth-user.usecase";
import { UpdateProfileUseCase } from "@/src/application/useCases/profileUseCases/update-profile.usecase";


/**
 * Build profile use cases for the current request.
 *
 * Why async?
 * - Supabase SSR client depends on request cookies, so it must be created per request.
 */
export async function make_profile_use_cases() {
  const supabase = await create_supabase_server_client();
  const repo = new SupabaseProfileRepository(supabase);

  return {
    create_profile: new CreateProfileUseCase(repo),
    get_profile_by_auth_user: new GetProfileByAuthUserUseCase(repo),
    update_profile: new UpdateProfileUseCase(repo),
    supabase, // handy if you want to read auth user in the route
  };
}
