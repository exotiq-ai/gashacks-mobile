import { describe, expect, it } from "vitest";
import { shouldUnlockPremiumForTesting } from "./entitlements";

describe("shouldUnlockPremiumForTesting", () => {
  it("unlocks premium when skip-auth tester mode is enabled", () => {
    expect(shouldUnlockPremiumForTesting({ skipAuth: true, appEnv: "development" })).toBe(true);
  });

  it("does not unlock premium in normal authenticated mode", () => {
    expect(shouldUnlockPremiumForTesting({ skipAuth: false, appEnv: "production" })).toBe(false);
  });
});
