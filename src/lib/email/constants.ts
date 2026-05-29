export const MCTC_EMAIL = {
  address: "info@mctctkd.com",
  fromName: "MCTC",
  from: "MCTC <info@mctctkd.com>",
  replyTo: "info@mctctkd.com",
  organization: "Midwest Collegiate Taekwondo Championship",
  websiteUrl: "https://www.mctctkd.com",
  logoUrl: "https://www.mctctkd.com/images/Logos/white%20logo.svg",
} as const;

/** Impact — matches confirmation + recovery templates */
export const MCTC_EMAIL_DISPLAY_FONT =
  "Impact, Haettenschweiler, 'Arial Narrow Bold', 'Arial Black', sans-serif";

export const MCTC_EMAIL_BODY_FONT = "Arial, Helvetica, sans-serif";

export const MCTC_EMAIL_SUBJECTS = {
  confirmation: "Confirm your MCTC Portal account",
  recovery: "Reset your MCTC Portal password",
} as const;
