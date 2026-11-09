// Cloud Function opcional: genera procedimientos, matrices y preguntas con Claude.
// Solo la pueden usar cuentas con rol editor o admin. La clave de la API queda guardada como secreto en Firebase.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");
const MODELO = process.env.CLAUDE_MODEL || "claude-sonnet-5-5";

exports.generarIA = onCall(
  { secrets: [ANTHROPIC_API_KEY], timeoutSeconds: 540, memory: "512MiB", maxInstances: 5 },
  async (req) => {
    if (!req.auth) throw new HttpsError("unauthenticated", "Inicie sesión para usar la IA.");
    const perfil = await admin.firestore().doc(`usuarios/${req.auth.uid}`).get();
    if (!perfil.exists || !["editor", "admin"].includes(perfil.data().rol)) {
      throw new HttpsError("permission-denied", "Solo los editores pueden usar la IA.");
    }
    const prompt = String((req.data && req.data.prompt) || "").slice(0, 90000);
    if (prompt.length < 50) throw new HttpsError("invalid-argument", "La instrucción está vacía.");

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY.value(),
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 16000,
        messages: [{ role: "user", content: prompt + "\n\nResponde únicamente con el JSON, sin texto adicional ni bloques de código." }],
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      throw new HttpsError(r.status === 429 ? "resource-exhausted" : "internal", `Error del servicio de IA (${r.status}): ${t.slice(0, 300)}`);
    }
    const j = await r.json();
    const texto = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    const a = texto.indexOf("{"), b = texto.lastIndexOf("}");
    if (a < 0 || b < a) throw new HttpsError("internal", "La IA no devolvió JSON.");
    try {
      return JSON.parse(texto.slice(a, b + 1));
    } catch (e) {
      throw new HttpsError("internal", "La respuesta de la IA llegó incompleta. Intente de nuevo.");
    }
  }
);
