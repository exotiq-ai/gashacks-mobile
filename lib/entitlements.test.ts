import { describe, expect, it } from "vitest";
import { shouldUnlockPremiumForTesting } from "./entitlements";

describe("shouldUnlockPremiumForTesting", () => {
  it("unlocks premium when Pro tester mode is enabled outside production", () => {
    expect(shouldUnlockPremiumForTesting({ unlockProForTesting: true, appEnv: "development" })).toBe(true);
  });

  it("does not unlock premium in normal authenticated mode", () => {
    expect(shouldUnlockPremiumForTesting({ unlockProForTesting: false, appEnv: "production" })).toBe(false);
  });

  it("does not couple skip-auth to premium access", () => {
    expect(shouldUnlockPremiumForTesting({ unlockProForTesting: false, appEnv: "development" })).toBe(false);
  });
});
