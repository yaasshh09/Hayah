const express = require("express");

const router = express.Router();
const endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent";

// The browser sends its own system prompt, so the child rules are added here too:
// nobody can talk the AI out of them by editing the request.
const CHILD_RULES =
  "You are talking with a child. Keep every answer kind, simple and age-appropriate. Never share the parents' budgets, debts or account details. Refuse anything unsafe and suggest asking a parent.";

// Keeps one visitor from burning through the Gemini quota.
// ponytail: per-instance memory, so serverless instances each count on their own. Use a shared store if abuse shows up.
const WINDOW_MS = 60_000,
  MAX_PER_WINDOW = 15,
  hits = new Map();
function rateLimited(req) {
  const ip = req.get("x-nf-client-connection-ip") || req.ip || "unknown",
    now = Date.now(),
    recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

router.post("/", async (req, res) => {
  if (rateLimited(req)) {
    res.set("Retry-After", "60");
    return res.status(429).json({ error: "Too many questions in a row. Wait a minute and try again." });
  }
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error:
        "Add GEMINI_API_KEY to your local .env file, then restart the server.",
    });
  }

  const { prompt, history, role, system, context } = req.body ?? {};

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > 2000 ||
    !["adult", "child"].includes(role)
  ) {
    return res.status(400).json({ error: "The AI request is invalid." });
  }

  const contents = (Array.isArray(history) ? history : [])
    .filter((message) => typeof message?.t === "string" && message.t.trim())
    .slice(-16)
    .map((message) => ({
      role: message.r === "model" ? "model" : "user",
      parts: [{ text: message.t.slice(-2000) }],
    }));

  const lastMessage = contents.at(-1);
  if (lastMessage?.role !== "user" || lastMessage.parts[0].text !== prompt) {
    contents.push({ role: "user", parts: [{ text: prompt }] });
  }

  const familyContext = JSON.stringify(context ?? {}).slice(0, 5000);
  const systemInstruction = [
    typeof system === "string" ? system.slice(0, 2000) : "",
    `Family data (JSON): ${familyContext}`,
    role === "child" ? CHILD_RULES : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
      }),
      signal: AbortSignal.timeout(45000),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(502).json({
          error:
            "Gemini could not find the configured model. Check the model ID in the server route.",
        });
      }

      const status = response.status === 429 ? 429 : 502;
      return res.status(status).json({
        error: `Hayati could not complete the request (HTTP ${response.status}).`,
      });
    }

    const reply = result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!reply) {
      return res.status(502).json({ error: "Hayati returned an empty reply." });
    }

    return res.json({ reply });
  } catch (error) {
    const timedOut = error.name === "TimeoutError";
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? "Hayati took too long to respond. Please try again."
        : "Hayati could not reach the AI service. Please try again.",
    });
  }
});

module.exports = router;
