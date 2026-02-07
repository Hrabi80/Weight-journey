/**
 * Error thrown when a user tries to pick a username that already exists.
 */
export class UsernameAlreadyExistsError extends Error {
  public readonly username: string;

  public constructor(username: string) {
    super(`Username already exists: ${username}`);
    this.name = "UsernameAlreadyExistsError";
    this.username = username;
  }
}

/**
 * Error thrown when an auth user attempts to create a second profile.
 */
export class ProfileAlreadyExistsForAuthUserError extends Error {
  public readonly auth_user_id: string;

  public constructor(auth_user_id: string) {
    super(`A profile already exists for auth user: ${auth_user_id}`);
    this.name = "ProfileAlreadyExistsForAuthUserError";
    this.auth_user_id = auth_user_id;
  }
}


/**
 * Error thrown when the profile does not exist for a given auth user.
 */
export class ProfileNotFoundForAuthUserError extends Error {
  public readonly auth_user_id: string;

  public constructor(auth_user_id: string) {
    super(`Profile not found for auth user: ${auth_user_id}`);
    this.name = "ProfileNotFoundForAuthUserError";
    this.auth_user_id = auth_user_id;
  }
}

/**
 * Error thrown when an update is requested but no updatable fields are provided.
 */
export class EmptyProfileUpdateError extends Error {
  public constructor() {
    super("No fields provided to update the profile.");
    this.name = "EmptyProfileUpdateError";
  }
}
