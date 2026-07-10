import { describe, expect, it, vi } from "vitest";
import { scanReceiptImage } from "./receiptScanner";

describe("scanReceiptImage", () => {
  it("uses a configured scan API when available", async () => {
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "https://scanner.test/receipt");
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({
        stationName: "Shell",
        gallonsE85: "7.1",
        pricePerGalE85: "$2.49",
        totalCost: "$17.68",
        confidence: 0.91,
      }),
    })));

    const result = await scanReceiptImage({ base64: "abc123" });

    expect(result.stationName).toBe("Shell");
    expect(result.gallonsE85).toBe(7.1);
    expect(result.pricePerGalE85).toBe(2.49);
    expect(result.totalCost).toBe(17.68);

    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reports a clear setup error when no scanner is configured", async () => {
    vi.stubEnv("EXPO_PUBLIC_RECEIPT_SCAN_API_URL", "");

    await expect(scanReceiptImage({ base64: "abc123" })).rejects.toThrow(
      "Receipt AI is not configured. Add EXPO_PUBLIC_RECEIPT_SCAN_API_URL.",
    );

    vi.unstubAllEnvs();
  });
});
