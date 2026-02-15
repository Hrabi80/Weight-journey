import { GetCurrentUserUseCase } from "@/src/application/use-cases/auth/get-current-user.use-case";
import { SignInUseCase } from "@/src/application/use-cases/auth/sign-in.use-case";
import { SignOutUseCase } from "@/src/application/use-cases/auth/sign-out.use-case";
import { SignUpUseCase } from "@/src/application/use-cases/auth/sign-up.use-case";
import { SupabaseAuthRepository } from "@/src/infrastructure/supabase/repositories/supabase-auth.repository";
import { create_supabase_server_client } from "@/src/infrastructure/supabase/server-client";

/**
 * Builds auth use cases for the current request.
 *
 * Supabase SSR client must be request-scoped because it relies on request cookies.
 */
export async function make_auth_use_cases() {
  const supabase = await create_supabase_server_client();
  const auth_repository = new SupabaseAuthRepository(supabase);

  return {
    sign_up: new SignUpUseCase(auth_repository),
    sign_in: new SignInUseCase(auth_repository),
    sign_out: new SignOutUseCase(auth_repository),
    get_current_user: new GetCurrentUserUseCase(auth_repository),
    supabase,
  };
}
