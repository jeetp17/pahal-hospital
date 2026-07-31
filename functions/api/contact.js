const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });

const readString = (form, key) => String(form.get(key) || "").trim();

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const maxLengths = {
  name: 100,
  email: 254,
  subject: 150,
  message: 2000
};

const isTooLong = (value, max) => value.length > max;

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const getZohoAccountsUrl = (env) => trimTrailingSlash(env.ZOHO_ACCOUNTS_URL || "https://accounts.zoho.com");
const getZohoMailApiBase = (env) => trimTrailingSlash(env.ZOHO_MAIL_API_BASE || "https://mail.zoho.com");

const getZohoTokenUrl = (env) => `${getZohoAccountsUrl(env)}/oauth/v2/token`;
const getZohoSendUrl = (env) =>
  `${getZohoMailApiBase(env)}/api/accounts/${encodeURIComponent(env.ZOHO_ACCOUNT_ID)}/messages`;

const verifyTurnstile = async ({ token, request, env }) => {
  if (!env.TURNSTILE_SECRET_KEY) {
    return {
      ok: false,
      status: 500,
      message: "Captcha service is not configured yet."
    };
  }

  if (!token) {
    return {
      ok: false,
      status: 400,
      message: "Please complete the captcha verification."
    };
  }

  const body = new FormData();
  body.append("secret", env.TURNSTILE_SECRET_KEY);
  body.append("response", token);

  const remoteIp = request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For");
  if (remoteIp) {
    body.append("remoteip", remoteIp);
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body
    });
    const result = await response.json();

    if (!result.success) {
      return {
        ok: false,
        status: 400,
        message: "Captcha verification failed. Please try again."
      };
    }
  } catch {
    return {
      ok: false,
      status: 502,
      message: "Captcha verification is unavailable. Please try again."
    };
  }

  return { ok: true };
};

const missingZohoConfig = (env) =>
  !env.ZOHO_ACCOUNT_ID ||
  !env.ZOHO_CLIENT_ID ||
  !env.ZOHO_CLIENT_SECRET ||
  !env.ZOHO_REFRESH_TOKEN;

const getZohoAccessToken = async (env) => {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    refresh_token: env.ZOHO_REFRESH_TOKEN
  });

  const response = await fetch(getZohoTokenUrl(env), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.access_token) {
    console.error("Zoho OAuth token refresh failed", {
      status: response.status,
      error: result?.error,
      errorDescription: result?.error_description
    });
    throw new Error("Zoho token refresh failed");
  }

  return result.access_token;
};

const sendZohoEmail = async ({ env, from, to, subject, html }) => {
  const accessToken = await getZohoAccessToken(env);
  const response = await fetch(getZohoSendUrl(env), {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fromAddress: from,
      toAddress: to,
      subject,
      content: html,
      mailFormat: "html"
    })
  });

  const result = await response.json().catch(() => null);
  const zohoStatusCode = Number(result?.status?.code || 0);
  const isZohoSuccess = response.ok && (!zohoStatusCode || zohoStatusCode < 400);

  if (!isZohoSuccess) {
    console.error("Zoho Mail API failed", {
      status: response.status,
      code: result?.status?.code,
      description: result?.status?.description,
      moreInfo: result?.data?.moreInfo
    });
    throw new Error("Zoho Mail API failed");
  }
};

async function handleContactPost({ request, env }) {
  let form;

  try {
    form = await request.formData();
  } catch {
    return json({ key: false, value: "Please submit the contact form again." }, 400);
  }

  const name = readString(form, "fname");
  const email = readString(form, "email_address");
  const subject = readString(form, "subject");
  const message = readString(form, "msg");
  const captchaToken = readString(form, "cf-turnstile-response");

  if (!name || !email || !subject || !message) {
    return json({ key: false, value: "Please fill in all required fields." }, 400);
  }

  if (!isEmail(email)) {
    return json({ key: false, value: "Please enter a valid email address." }, 400);
  }

  if (
    isTooLong(name, maxLengths.name) ||
    isTooLong(email, maxLengths.email) ||
    isTooLong(subject, maxLengths.subject) ||
    isTooLong(message, maxLengths.message)
  ) {
    return json({ key: false, value: "Please shorten your message and try again." }, 400);
  }

  const captcha = await verifyTurnstile({ token: captchaToken, request, env });
  if (!captcha.ok) {
    return json({ key: false, value: captcha.message }, captcha.status);
  }

  if (missingZohoConfig(env)) {
    return json({ key: false, value: "Email service is not configured yet." }, 500);
  }

  const to = env.CONTACT_TO || "info@pahalhospital.com";
  const from = env.CONTACT_FROM || "noreply@pahalhospital.com";
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    await sendZohoEmail({
      env,
      from,
      to,
      subject: `Website enquiry: ${subject}`,
      html
    });
  } catch {
    return json({ key: false, value: "Problem while sending email, please call the hospital directly." }, 502);
  }

  return json({ key: true, value: "Thank you! we'll contact you shortly." });
}

export async function onRequest({ request, env }) {
  if (request.method === "GET") {
    return json({ key: false, value: "Method not allowed." }, 405);
  }

  if (request.method !== "POST") {
    return json({ key: false, value: "Method not allowed." }, 405);
  }

  try {
    return await handleContactPost({ request, env });
  } catch (error) {
    console.error("Unhandled contact form error", error);
    return json({ key: false, value: "We could not process the message. Please call the hospital directly." }, 500);
  }
}
