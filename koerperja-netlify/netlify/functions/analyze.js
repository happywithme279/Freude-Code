// Netlify Function: /.netlify/functions/analyze
// Nimmt die Anfrage vom KörperJa-Frontend entgegen, ruft die Anthropic API
// SERVERSEITIG mit dem geheimen API-Schlüssel auf und gibt die Antwort zurück.
// Der Schlüssel steht NIE im Frontend-Code, sondern nur als Umgebungsvariable hier.

exports.handler = async function (event) {
  // Nur POST-Anfragen erlauben
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: { message: "Method Not Allowed" } }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: "ANTHROPIC_API_KEY ist auf dem Server nicht gesetzt (Netlify Umgebungsvariable fehlt)." } })
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ungültiger Request-Body." } }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: payload.model || "claude-sonnet-4-6",
        max_tokens: payload.max_tokens || 3000,
        messages: payload.messages
      })
    });

    const data = await response.json();

    return {
      statusCode: response.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: "Fehler beim Aufruf der Anthropic API: " + err.message } })
    };
  }
};
