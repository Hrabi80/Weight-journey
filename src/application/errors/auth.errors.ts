/**
 * Error thrown when sign-in credentials are invalid.
 */
export class InvalidCredentialsError extends Error {
  public constructor() {
    super("Invalid email or password.");
    this.name = "InvalidCredentialsError";
  }
}

/**
 * Error thrown when trying to register an already used email.
 */
export class AuthEmailAlreadyInUseError extends Error {
  public constructor() {
    super("Email already in use.");
    this.name = "AuthEmailAlreadyInUseError";
  }
}

/**
 * Error thrown when auth operation expected a session/user but it was missing.
 */
export class AuthSessionMissingError extends Error {
  public constructor(message = "Authentication session is missing.") {
    super(message);
    this.name = "AuthSessionMissingError";
  }
}

/**
 * Error thrown for unmapped or unknown auth failures.
 *
 * The message is intentionally safe for API responses.
 */
export class AuthUnexpectedError extends Error {
  public constructor(message = "Authentication failed unexpectedly.") {
    super(message);
    this.name = "AuthUnexpectedError";
  }
}
