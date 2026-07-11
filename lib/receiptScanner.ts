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
  const normalized = value.replace(/[^0-9.]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
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
  const apiUrl =
    process.env.EXPO_PUBLIC_RECEIPT_SCAN_API_URL ||
    (typeof window !== "undefined" ? "/.netlify/functions/receipt-scan" : "");

  if (!apiUrl) {
    throw new Error("Receipt AI is not configured. Add EXPO_PUBLIC_RECEIPT_SCAN_API_URL.");
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: base64, mimeType }),
  });
  if (!response.ok) throw new Error(`Receipt scan failed: ${response.status}`);
  return normalizeScanResult(await response.json() as Partial<ReceiptScanResult>);
}
