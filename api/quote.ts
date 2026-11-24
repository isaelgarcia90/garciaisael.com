// Vercel Function: receives the "Get a quote" form and posts it to Discord.
// Uses DISCORD_QUOTE_WEBHOOK_URL if set (e.g. a #cotizaciones channel), else DISCORD_WEBHOOK_URL.

declare const process: { env: Record<string, string | undefined> };

const ALLOWED_HOSTS = ["garciaisael.com", "www.garciaisael.com"];
// Vercel preview deployments of this project
const PREVIEW_HOST = /^garciaisael-com-[a-z0-9-]+-isaels-projects-af560b54\.vercel\.app$/;

const TIMELINES: Record<string, string> = {
  "under-1-month": "Menos de 1 mes",
  "1-3-months": "1 a 3 meses",
  "3-6-months": "3 a 6 meses",
  flexible: "Flexible / no sabe",
};

const DATA_STATES: Record<string, string> = {
  ready: "Sí, organizados y listos (D1)",
  partial: "En parte, necesitan limpieza (D2)",
  "needs-help": "No, necesitan ayuda con eso (D3)",
  unsure: "No está seguro",
};

// One line: strip line breaks and Discord markdown/mention characters
const line = (value: unknown, max = 120) =>
  String(value ?? "").replace(/[\r\n`*_~|<>@]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

// Multi-line text: keep line breaks, strip markdown/mention characters
const text = (value: unknown, max = 1000) =>
  String(value ?? "")
    .replace(/\r/g, "")
    .replace(/[`*_~|<>@]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export async function POST(request: Request) {
  let originHost = "";
  try {
    originHost = new URL(request.headers.get("origin") ?? "").hostname;
  } catch {
    return json(403, { ok: false });
  }
  if (!ALLOWED_HOSTS.includes(originHost) && !PREVIEW_HOST.test(originHost)) {
    return json(403, { ok: false });
  }

  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json(400, { ok: false, error: "invalid" });
  }

  // Honeypot: real people never fill the hidden "website" field
  if (line(body.website)) return json(200, { ok: true });

  const name = line(body.name, 80);
  const email = String(body.email ?? "").replace(/[\s`*~|<>]/g, "").slice(0, 120);
  const company = line(body.company, 100);
  const goal = text(body.goal);
  const results = text(body.results);
  const timeline = TIMELINES[line(body.timeline, 30)];
  const data = DATA_STATES[line(body.data, 30)];
  const dataDetail = text(body.dataDetail, 500);

  const emailOk = /^[^\s]+@[^\s]+\.[^\s]+$/.test(email);
  if (!name || !emailOk || !goal || !results || !timeline || !data) {
    return json(400, { ok: false, error: "invalid" });
  }

  const webhook = process.env.DISCORD_QUOTE_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return json(503, { ok: false, error: "unavailable" });

  const country = line(request.headers.get("x-vercel-ip-country"), 2).toUpperCase();

  const message = {
    username: "garciaisael.com",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "Nueva solicitud de cotización de IA",
        color: 0xa78bfa,
        fields: [
          { name: "Nombre", value: name, inline: true },
          { name: "Correo", value: email, inline: true },
          { name: "Empresa", value: company || "-", inline: true },
          { name: "1. Objetivo principal", value: goal },
          { name: "2. Resultados esperados en el día a día", value: results },
          { name: "3. Plazo ideal", value: timeline, inline: true },
          { name: "4. Datos organizados", value: data, inline: true },
          ...(dataDetail ? [{ name: "Detalle de los datos", value: dataDetail }] : []),
          ...(country ? [{ name: "País", value: country, inline: true }] : []),
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) return json(502, { ok: false, error: "unavailable" });
  } catch {
    return json(502, { ok: false, error: "unavailable" });
  }

  return json(200, { ok: true });
}
