export interface AuthErrorInfo {
  error: string;
  code?: string;
}

const RATE_LIMIT_CODES = new Set([
  "over_request_rate_limit",
  "over_email_send_rate_limit",
]);

export function authErrorMessage(
  error: { code?: string; message: string },
  fallback = "We could not complete that request. Try again.",
): AuthErrorInfo {
  const code = error.code;

  switch (code) {
    case "email_not_confirmed":
      return {
        error:
          "Confirm your email before signing in. We can send you a new confirmation link.",
        code,
      };
    case "invalid_credentials":
      return { error: "Email or password is incorrect.", code };
    case "user_banned":
      return {
        error: "This account is suspended. Contact support if you think this is a mistake.",
        code,
      };
    case "weak_password":
      return {
        error: "Choose a stronger password with at least 8 characters.",
        code,
      };
    case "signup_disabled":
      return {
        error: "New signups are paused right now. Please try again later.",
        code,
      };
    case "email_exists":
    case "user_already_exists":
      return {
        error:
          "If an account already exists for this email, sign in or reset your password.",
        code,
      };
    default:
      if (code && RATE_LIMIT_CODES.has(code)) {
        return {
          error: "Too many attempts. Wait a minute and try again.",
          code,
        };
      }

      if (error.message.toLowerCase().includes("rate limit")) {
        return {
          error: "Too many attempts. Wait a minute and try again.",
          code,
        };
      }

      return { error: fallback };
  }
}

export function isRateLimitError(error: { code?: string; message: string }) {
  return Boolean(
    (error.code && RATE_LIMIT_CODES.has(error.code)) ||
      error.message.toLowerCase().includes("rate limit"),
  );
}
