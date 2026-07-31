# Pahal Hospital Website

Astro website for Pahal Hospital, built for Cloudflare Pages.

## Requirements

- Node.js 22
- npm
- Cloudflare Pages for hosting
- Cloudflare Turnstile for contact form captcha
- Cloudflare Pages Function for `/api/contact`

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

The project uses a Cloudflare Email binding named `EMAIL`.

Current `wrangler.toml`:

```toml
name = "pahal-hospital-astro"
compatibility_date = "2026-07-31"
pages_build_output_dir = "dist"

[[send_email]]
name = "EMAIL"
destination_address = "info@pahalhospital.com"
```

The form sends:

```text
To: info@pahalhospital.com
From: noreply@pahalhospital.com
Reply-To: visitor email address
```

No SMTP port, username, or password is required for this setup.

## Cloudflare Pages Deployment

Use GitHub deployment instead of static dashboard upload, because the contact form needs the `functions/` directory.

Cloudflare Pages settings:

```text
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node version: 22
```

Add these Cloudflare Pages variables/secrets:

```text
CONTACT_TO=info@pahalhospital.com
CONTACT_FROM=noreply@pahalhospital.com
PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
```

Set `TURNSTILE_SECRET_KEY` as a secret/encrypted variable.

After adding variables, redeploy the site.

## Cloudflare Email Setup

For the free fixed-recipient setup:

1. Go to Cloudflare Dashboard.
2. Open `Compute` -> `Email Service` -> `Email Routing`.
3. Add and verify the destination address:

```text
info@pahalhospital.com
```

4. Keep the `send_email` binding in `wrangler.toml`.
5. Redeploy Cloudflare Pages.

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
- `Email service is not configured yet.` means the Cloudflare Email binding is not active.
- `Problem while sending email` means the destination/from email setup needs checking in Cloudflare.

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