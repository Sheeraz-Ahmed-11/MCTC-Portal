# MCTC auth email setup

## Reset email works but confirmation email does not

Recovery and confirmation use **different templates** in Supabase. If only reset works:

1. **Authentication → Email templates → Confirm signup** — paste `supabase/templates/confirmation.html` and **Save** (not only Reset password).
2. Temporarily reset **Confirm signup** to Supabase’s default template and sign up with a **new email** — if that arrives, your custom confirmation HTML is breaking the send.
3. **Duplicate signup** — signing up again with the same email does **not** send another mail. Use **Resend confirmation** on the signup screen or login (when “email not confirmed”).
4. Search spam for **Supabase Auth** / `noreply@mail.app.supabase.io` (not only `info@mctctkd.com` until SMTP is configured).
5. **Authentication → Logs** — check for errors on `user.signup` right after signup.

---

Your screenshot shows the **default Supabase email** (`Supabase Auth` / `noreply@mail.app.supabase.io`). Replace it with the branded templates in this repo.

Templates:

- `supabase/templates/confirmation.html` — signup confirmation
- `supabase/templates/recovery.html` — password reset

Logo URL: `https://www.mctctkd.com/images/Logos/white%20logo.svg` (hosted on your main site)

Headings and buttons use **Impact** (same in confirmation + recovery). Body copy uses **Arial**.

Sender: **MCTC** &lt;info@mctctkd.com&gt;

---

## Step 1 — Paste the branded template (removes “Powered by Supabase”)

1. Supabase Dashboard → **Authentication** → **Email templates**.
2. Open **Confirm signup**.
3. **Subject:** `Confirm your MCTC Portal account`
4. Switch to **Source** (HTML) and **delete** the default body.
5. Copy the full contents of `supabase/templates/confirmation.html` and paste.
6. **Save**.
7. Repeat for **Reset password** using `supabase/templates/recovery.html`  
   **Subject:** `Reset your MCTC Portal password`

Do not remove `{{ .ConfirmationURL }}`, `{{ .Email }}`, or `{{ .SiteURL }}`.

---

## Step 2 — Sender name “MCTC” and address info@mctctkd.com

The inbox line **“Supabase Auth”** and **noreply@mail.app.supabase.io** only change when you use **custom SMTP**.

1. **Authentication** → **SMTP settings** → enable custom SMTP.
2. Use your host for `info@mctctkd.com` (Google Workspace, Microsoft 365, etc.).
3. Set:
   - **Sender email:** `info@mctctkd.com`
   - **Sender name:** `MCTC`
4. Save and send a test email.

Configure SPF/DKIM for `mctctkd.com` with your mail provider.

---

## Step 3 — Logo in Gmail’s profile circle

Gmail’s round avatar beside the sender is **not** taken from the email HTML. It comes from:

- The profile photo on **info@mctctkd.com** (Google Workspace / Microsoft), or  
- [Gravatar](https://gravatar.com) for that address (upload your MCTC logo there).

The **logo inside the email** is the image in the maroon header (`mctc-logo-white.svg`). That requires your **Site URL** in Supabase to match a deployed app where the file is public:

1. **Authentication** → **URL configuration** → **Site URL**  
   e.g. `https://portal.mctctkd.com` or your Vercel preview URL.
2. Deploy the app (logo is in `public/mctc-logo-white.svg`).
3. Confirm the logo loads: [mctctkd.com white logo](https://www.mctctkd.com/images/Logos/white%20logo.svg)

---

## Step 4 — App environment

```env
NEXT_PUBLIC_SITE_URL=https://mctc-portal.vercel.app
```

Redirect URLs must include `{SITE_URL}/auth/callback`.

### Localhost email confirm → `/onboarding`

1. **Supabase → Authentication → URL configuration**
   - **Site URL (while testing locally):** `http://localhost:3000` — not `/dashboard` and not the Vercel URL.
   - **Redirect URLs:** keep `http://localhost:3000/auth/callback` (add `http://localhost:3000/**` if redirects fail).
2. Sign up again and use a **new** confirmation email (old links still point at the previous redirect).
3. The confirm link should end with  
   `redirect_to=http://localhost:3000/auth/callback?next=%2Fonboarding`  
   then land on `http://localhost:3000/onboarding`.
4. Optional in `.env.local`: `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

When you deploy, set **Site URL** back to `https://mctc-portal.vercel.app` (no path).

---

## Quick checklist

| What you want | Where to set it |
|---------------|-----------------|
| Branded email body + no Supabase footer | Paste HTML from `supabase/templates/` |
| Sender shows **MCTC** | SMTP → Sender name: `MCTC` |
| From **info@mctctkd.com** | SMTP → Sender email |
| Logo in email header | Deploy app + correct Site URL |
| Logo in Gmail avatar circle | Gravatar or mailbox profile photo for info@mctctkd.com |
