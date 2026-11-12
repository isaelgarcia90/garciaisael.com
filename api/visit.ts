// Vercel Function: sends a Discord message for each new visit to the site.
// Needs the DISCORD_WEBHOOK_URL environment variable in the Vercel project.

declare const process: { env: Record<string, string | undefined> };

const ALLOWED_HOSTS = ["garciaisael.com", "www.garciaisael.com"];
const BOT_PATTERN = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;

const clean = (value: unknown, max = 120) =>
  String(value ?? "").replace(/[\r\n`*_~|<>@]/g, " ").trim().slice(0, max);

const flag = (country: string) =>
  /^[A-Z]{2}$/.test(country)
    ? String.fromCodePoint(...[...country].map((c) => 127397 + c.charCodeAt(0)))
    : "";

function referrerLabel(referrer: string) {
  if (!referrer) return "Directo";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (ALLOWED_HOSTS.includes(host)) return "Directo";
    return host;
  } catch {
    return "Desconocido";
  }
}

function deviceLabel(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "Tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "Móvil";
  return "Escritorio";
}

export async function POST(request: Request) {
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if (!webhook) return new Response(null, { status: 204 });

  // Only count visits coming from the real site, not from other pages or scripts
  const origin = request.headers.get("origin") ?? "";
  let originHost = "";
  try {
    originHost = new URL(origin).hostname;
  } catch {
    return new Response(null, { status: 403 });
  }
  if (!ALLOWED_HOSTS.includes(originHost)) return new Response(null, { status: 403 });

  const ua = request.headers.get("user-agent") ?? "";
  if (BOT_PATTERN.test(ua)) return new Response(null, { status: 204 });

  let body: { referrer?: string } = {};
  try {
    body = JSON.parse(await request.text());
  } catch {
    // ignore malformed bodies
  }

  const country = clean(request.headers.get("x-vercel-ip-country"), 2).toUpperCase();
  const city = clean(decodeURIComponent(request.headers.get("x-vercel-ip-city") ?? ""), 60);
  const place = [flag(country), city || country || "Ubicación desconocida"].join(" ").trim();

  const message = {
    username: "garciaisael.com",
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: "Nueva visita a garciaisael.com",
        color: 0xff3b3b,
        fields: [
          { name: "Ubicación", value: place, inline: true },
          { name: "Dispositivo", value: deviceLabel(ua), inline: true },
          { name: "Llegó desde", value: clean(referrerLabel(clean(body.referrer, 300))), inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  }).catch(() => undefined);

  return new Response(null, { status: 204 });
}
