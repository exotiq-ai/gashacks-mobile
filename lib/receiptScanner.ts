export type ReceiptScanResult = {
  stationName: string | null;
  stationAddress: string | null;
  purchasedAt: string | null;
  gallonsE85: number | null;
  gallonsPump: number | null;
  pricePerGalE85: number | null;
  pricePerGalPump: number | null;
  totalCost: number | null;
  ethanolPercent: number | null;
  confidence: number;
  rawText: string | null;
};

const EMPTY_SCAN: ReceiptScanResult = {
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

type ScanReceiptImageInput = {
  base64: string;
  mimeType?: string;
};

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeScanResult(value: Partial<ReceiptScanResult>): ReceiptScanResult {
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

function parseJsonFromModel(text: string): ReceiptScanResult {
  const trimmed = text.trim();
  const jsonText =
    trimmed.match(/```json\s*([\s\S]*?)\s*```/i)?.[1] ??
    trimmed.match(/\{[\s\S]*\}/)?.[0] ??
    trimmed;
  return normalizeScanResult(JSON.parse(jsonText) as Partial<ReceiptScanResult>);
}

export async function scanReceiptImage({
  base64,
  mimeType = "image/jpeg",
}: ScanReceiptImageInput): Promise<ReceiptScanResult> {
  const apiUrl = process.env.EXPO_PUBLIC_RECEIPT_SCAN_API_URL;

  if (apiUrl) {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });
    if (!response.ok) throw new Error(`Receipt scan failed: ${response.status}`);
    return normalizeScanResult(await response.json() as Partial<ReceiptScanResult>);
  }

  const openAiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!openAiKey) {
    throw new Error("Receipt AI is not configured. Add EXPO_PUBLIC_RECEIPT_SCAN_API_URL or EXPO_PUBLIC_OPENAI_API_KEY.");
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
              image_url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(`Receipt scan failed: ${response.status}`);

  const data = await response.json() as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string }> }>;
  };
  const text =
    data.output_text ??
    data.output?.flatMap((item) => item.content ?? []).map((item) => item.text).filter(Boolean).join("\n") ??
    "";

  if (!text.trim()) return EMPTY_SCAN;
  return parseJsonFromModel(text);
}
