export type AuthState = {
  error?: string;
  message?: string;
  pendingEmail?: string;
  /** Show resend confirmation UI on login when email is not verified */
  needsEmailConfirmation?: boolean;
};