# Pahal Hospital Website

Astro website for Pahal Hospital, built for Cloudflare Pages.

## Requirements

- Node.js 22
- npm
- Cloudflare Pages for hosting
- Cloudflare Turnstile for contact form captcha
- Cloudflare Pages Function for `/api/contact`
- Zoho Mail API for contact form email sending

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```env
CONTACT_TO=info@pahalhospital.com
CONTACT_FROM=info@pahalhospital.com
PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
ZOHO_ACCOUNTS_URL=https://accounts.zoho.com
ZOHO_MAIL_API_BASE=https://mail.zoho.com
ZOHO_ACCOUNT_ID=1593302000000008002your-zoho-mail-account-id
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token
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

The project sends email through the Zoho Mail API.

No SMTP port, SMTP password, Cloudflare Email Sending, or Workers `send_email` binding is required.

The form sends:

```text
To: info@pahalhospital.com
From: info@pahalhospital.com
Visitor email: included inside the message body
```

The Pages Function refreshes the Zoho OAuth access token with `ZOHO_REFRESH_TOKEN`, then sends through:

```text
POST https://mail.zoho.com/api/accounts/{zoho_account_id}/messages
```

Use the matching Zoho region if the mailbox is not on India data center:

```text
India: ZOHO_ACCOUNTS_URL=https://accounts.zoho.com, ZOHO_MAIL_API_BASE=https://mail.zoho.com
US:    ZOHO_ACCOUNTS_URL=https://accounts.zoho.com, ZOHO_MAIL_API_BASE=https://mail.zoho.com
EU:    ZOHO_ACCOUNTS_URL=https://accounts.zoho.eu, ZOHO_MAIL_API_BASE=https://mail.zoho.eu
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

Current `wrangler.toml` stores non-secret values:

```toml
name = "pahal-hospital"
compatibility_date = "2026-07-31"
pages_build_output_dir = "dist"

[vars]
CONTACT_TO = "info@pahalhospital.com"
CONTACT_FROM = "info@pahalhospital.com"
PUBLIC_TURNSTILE_SITE_KEY = "your-turnstile-site-key"
ZOHO_ACCOUNTS_URL = "https://accounts.zoho.com"
ZOHO_MAIL_API_BASE = "https://mail.zoho.com"
```

Set these in Cloudflare Pages as secret/encrypted variables:

```text
TURNSTILE_SECRET_KEY
ZOHO_ACCOUNT_ID
ZOHO_CLIENT_ID
ZOHO_CLIENT_SECRET
ZOHO_REFRESH_TOKEN
```

After changing `wrangler.toml` or secrets, redeploy the site.

## Zoho Mail API Setup

1. Open Zoho API Console.
2. Create a Self Client.
3. Generate an authorization code with scopes:

```text
ZohoMail.messages.CREATE,ZohoMail.accounts.READ
```

4. Exchange the code for a refresh token.
5. Use the access token to call `/api/accounts` and copy the account ID for `info@pahalhospital.com`.
6. Put `ZOHO_ACCOUNT_ID`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` into Cloudflare Pages secrets.

Do not commit Zoho secrets.

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
- `Email service is not configured yet.` means one of `ZOHO_ACCOUNT_ID`, `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, or `ZOHO_REFRESH_TOKEN` is missing.
- `Problem while sending email` means the Zoho token, account ID, sender mailbox, or Zoho API scope needs checking.

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
