const EMPTY_SCAN = {
  stationName: null,
  stationAddress: null,
  purchasedAt: null,
  gallonsE85: null,
  gallonsPump: null,
  pricePerGalE85: null,
  pricePerGalPump: null,
  totalCost: null,
  ethanolPercent: null,
  confidence: 0,
  rawText: null,
};

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

function normalizeNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeScanResult(value = {}) {
  return {
    stationName: typeof value.stationName === "string" ? value.stationName : null,
    stationAddress: typeof value.stationAddress === "string" ? value.stationAddress : null,
    purchasedAt: typeof value.purchasedAt === "string" ? value.purchasedAt : null,
    gallonsE85: normalizeNumber(value.gallonsE85),
    gallonsPump: normalizeNumber(value.gallonsPump),
    pricePerGalE85: normalizeNumber(value.pricePerGalE85),
    pricePerGalPump: normalizeNumber(value.pricePerGalPump),
    totalCost: normalizeNumber(value.totalCost),
    ethanolPercent: normalizeNumber(value.ethanolPercent),
    confidence: Math.max(0, Math.min(1, normalizeNumber(value.confidence) ?? 0.55)),
    rawText: typeof value.rawText === "string" ? value.rawText : null,
  };
}

function parseJsonFromModel(text) {
  const trimmed = text.trim();
  const jsonText =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] ??
    trimmed.match(/\{[\s\S]*\}/)?.[0] ??
    trimmed;
  return normalizeScanResult(JSON.parse(jsonText));
}

function extractOutputText(data) {
  if (typeof data.output_text === "string") return data.output_text;
  return (data.output ?? [])
    .flatMap((item) => item.content ?? [])
    .map((item) => item.text ?? "")
    .filter(Boolean)
    .join("\n");
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) return json(500, { error: "Receipt AI is not configured." });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }

  const imageBase64 = payload.imageBase64;
  const mimeType = payload.mimeType || "image/jpeg";
  if (typeof imageBase64 !== "string" || imageBase64.length < 20) {
    return json(400, { error: "Missing receipt image." });
  }

  const prompt = [
    "Extract every useful detail from this fuel receipt for an ethanol blend log.",
    "Return only JSON with keys:",
    "stationName, stationAddress, purchasedAt, gallonsE85, gallonsPump, pricePerGalE85, pricePerGalPump, totalCost, ethanolPercent, confidence, rawText.",
    "Classify E85/ethanol/flex fuel lines as gallonsE85. Classify premium/unleaded/super gasoline as gallonsPump.",
    "Use null for fields you cannot read. confidence must be 0 to 1.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    return json(response.status, { error: "Receipt scan failed." });
  }

  const data = await response.json();
  const text = extractOutputText(data);
  if (!text.trim()) return json(200, EMPTY_SCAN);

  try {
    return json(200, parseJsonFromModel(text));
  } catch {
    return json(200, normalizeScanResult({ ...EMPTY_SCAN, rawText: text, confidence: 0.35 }));
  }
};
