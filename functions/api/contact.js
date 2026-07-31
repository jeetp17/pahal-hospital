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

export async function onRequestPost({ request, env }) {
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

  if (!env.EMAIL || typeof env.EMAIL.send !== "function") {
    return json({ key: false, value: "Email service is not configured yet." }, 500);
  }

  const to = env.CONTACT_TO || "info@pahalhospital.com";
  const from = env.CONTACT_FROM || "noreply@pahalhospital.com";
  const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
  const html = `
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
  `;

  try {
    await env.EMAIL.send({
      to,
      from,
      replyTo: email,
      subject: `Website enquiry: ${subject}`,
      text,
      html
    });
  } catch {
    return json({ key: false, value: "Problem while sending email, please call the hospital directly." }, 502);
  }

  return json({ key: true, value: "Thank you! we'll contact you shortly." });
}

export function onRequestGet() {
  return json({ key: false, value: "Method not allowed." }, 405);
}