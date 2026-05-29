export type PasswordStrength = "empty" | "weak" | "fair" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "empty";

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

export function getPasswordStrengthLabel(strength: PasswordStrength) {
  switch (strength) {
    case "weak":
      return "Weak password";
    case "fair":
      return "Fair password";
    case "strong":
      return "Strong password";
    default:
      return null;
  }
}

export function getPasswordStrengthBar(strength: PasswordStrength) {
  switch (strength) {
    case "weak":
      return { width: "33%", barClass: "bg-red-500" };
    case "fair":
      return { width: "66%", barClass: "bg-amber-500" };
    case "strong":
      return { width: "100%", barClass: "bg-emerald-500" };
    default:
      return { width: "0%", barClass: "bg-transparent" };
  }
}
