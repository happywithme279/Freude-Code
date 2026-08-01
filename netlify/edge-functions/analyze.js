export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: { message: "Method Not Allowed" } }), {
      status: 405,
      headers: { "content-type": "application/json" }
    });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: { message: "ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt (Netlify Umgebungsvariable fehlt)." } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: { message: "Ungültiger Request-Body." } }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  let anthropicResponse;
  try {
    anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: payload.model || "claude-sonnet-4-6",
        max_tokens: payload.max_tokens || 3000,
        messages: payload.messages,
        stream: true
      })
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: "Fehler beim Aufruf der Anthropic API: " + err.message } }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  if (!anthropicResponse.ok) {
    const errText = await anthropicResponse.text();
    return new Response(errText, {
      status: anthropicResponse.status,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(anthropicResponse.body, {
    status: 200,
    headers: { "content-type": "text/event-stream; charset=utf-8" }
  });
};

export const config = { path: "/api/analyze" };
