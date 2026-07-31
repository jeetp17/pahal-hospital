# Pahal Hospital Website

Astro website for Pahal Hospital, built for Cloudflare Pages.

## Requirements

- Node.js 22
- npm
- Cloudflare Pages for hosting
- Cloudflare Turnstile for contact form captcha
- Cloudflare Pages Function for `/api/contact`
- Cloudflare Email Service REST API for contact form email sending

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```env
CONTACT_TO=info@pahalhospital.com
CONTACT_FROM=noreply@pahalhospital.com
PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_EMAIL_API_TOKEN=your-cloudflare-email-api-token
```

Run the site locally:

```bash
npm run dev
```

Build the production output:

```bash
npm run build
```

Preview the built Astro site:

```bash
npm run preview
```

## Contact Form

The contact form posts to:

```text
/api/contact
```

The API is implemented as a Cloudflare Pages Function:

```text
functions/api/contact.js
```

The form includes:

- Required field validation
- Email format validation
- Maximum field length validation
- Cloudflare Turnstile captcha validation
- Success and failure messages that auto-hide after a few seconds

## Email Sending

The project sends email through the Cloudflare Email Service REST API.

No SMTP port, username, password, or Workers `send_email` binding is required.

Current `wrangler.toml`:

```toml
name = "pahal-hospital"
compatibility_date = "2026-07-31"
pages_build_output_dir = "dist"
```

The form sends:

```text
To: info@pahalhospital.com
From: noreply@pahalhospital.com
Reply-To: visitor email address
```

The REST API endpoint used by the Pages Function is:

```text
POST https://api.cloudflare.com/client/v4/accounts/{account_id}/email/sending/send
```

## Cloudflare Pages Deployment

Use GitHub deployment instead of static dashboard upload, because the contact form needs the `functions/` directory.

Cloudflare Pages settings:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 22
```

Add these Cloudflare Pages variables/secrets:

```text
CONTACT_TO=info@pahalhospital.com
CONTACT_FROM=noreply@pahalhospital.com
PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_EMAIL_API_TOKEN=your-cloudflare-email-api-token
```

Set these as secret/encrypted variables:

```text
TURNSTILE_SECRET_KEY
CLOUDFLARE_EMAIL_API_TOKEN
```

After adding variables, redeploy the site.

## Cloudflare Email Setup

1. Go to Cloudflare Dashboard.
2. Open `Compute` -> `Email Service`.
3. Configure Email Sending for `pahalhospital.com` or verify the allowed destination/sender required by your Cloudflare Email plan.
4. Create an API token with permission to send emails.
5. Add the token to Cloudflare Pages as `CLOUDFLARE_EMAIL_API_TOKEN`.
6. Add the account ID to Cloudflare Pages as `CLOUDFLARE_ACCOUNT_ID`.

## Testing Contact Form After Deployment

First test the API endpoint:

```text
https://your-domain.com/api/contact
```

Expected response for a browser GET request:

```json
{"key":false,"value":"Method not allowed."}
```

That means the Pages Function is active.

Then test the contact page:

```text
https://your-domain.com/contact
```

Complete the captcha and submit the form.

Common errors:

- `Captcha service is not configured yet.` means `TURNSTILE_SECRET_KEY` is missing.
- `Captcha verification failed.` means the Turnstile keys do not match or the domain is not allowed.
- `Email service is not configured yet.` means `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_EMAIL_API_TOKEN` is missing.
- `Problem while sending email` means the Cloudflare Email API token, sender, recipient, or Email Service setup needs checking.

## Main Routes

- `/`
- `/about`
- `/about/our-hospital`
- `/about/our-team`
- `/services`
- `/testimonials`
- `/contact`
- `/privacy-policy`
- `/terms-and-conditions`
- `/medical-disclaimer`
- `/sitemap`
- `/sitemap.xml`
- `/robots.txt`

## Git Notes

Do not commit local secrets.

Ignored local files include:

- `.env`
- `.env.*`
- `.dev.vars`
- `dist/`
- `.astro/`
- `node_modules/`
- logs and local server output

Commit `.env.example`, `wrangler.toml`, `functions/`, `src/`, `public/`, `package.json`, and `package-lock.json`.