import { describe, expect, it } from "vitest";
import {
  calculateBlend,
  calculateEmptyTankBlend,
  calculateEthanolOnlyBlend,
  type BlendInput,
  type OctaneConfig,
} from "./calculator";

const DEFAULT_OCTANE: OctaneConfig = {
  pumpGasOctane: 91,
  ethanolFuelOctane: 105,
};

describe("calculateBlend", () => {
  it("calculates E30 from E10 quarter tank", () => {
    const input: BlendInput = {
      tankSize: 15,
      currentLevel: 25,
      currentEthanol: 10,
      targetEthanol: 30,
      pumpGasEthanol: 10,
      ethanolFuelPercent: 85,
    };

    const result = calculateBlend(input, DEFAULT_OCTANE);
    expect(result.canFillToTarget).toBe(true);
    expect(result.resultingMix).toBeCloseTo(30, 0);
  });

  it("rejects impossible blend reductions", () => {
    const input: BlendInput = {
      tankSize: 15,
      currentLevel: 50,
      currentEthanol: 50,
      targetEthanol: 30,
      pumpGasEthanol: 10,
      ethanolFuelPercent: 85,
    };

    const result = calculateBlend(input, DEFAULT_OCTANE);
    expect(result.canFillToTarget).toBe(false);
    expect(result.errorMessage).toContain("Can't reduce E-mix");
  });

  it("never exceeds tank capacity", () => {
    const input: BlendInput = {
      tankSize: 10,
      currentLevel: 50,
      currentEthanol: 10,
      targetEthanol: 85,
      pumpGasEthanol: 10,
      ethanolFuelPercent: 85,
    };

    const result = calculateBlend(input, DEFAULT_OCTANE);
    expect(result.totalFuelAfter).toBeLessThanOrEqual(10);
  });
});

describe("calculateEmptyTankBlend", () => {
  it("calculates an E85 target from empty", () => {
    const result = calculateEmptyTankBlend(15, 85, 10, 85, DEFAULT_OCTANE);
    expect(result.currentFuelVolume).toBe(0);
    expect(result.resultingMix).toBeCloseTo(85, 1);
  });
});

describe("calculateEthanolOnlyBlend", () => {
  it("fills remaining tank with ethanol only", () => {
    const input: BlendInput = {
      tankSize: 15,
      currentLevel: 40,
      currentEthanol: 20,
      targetEthanol: 85,
      pumpGasEthanol: 10,
      ethanolFuelPercent: 85,
    };

    const result = calculateEthanolOnlyBlend(input, DEFAULT_OCTANE);
    expect(result.pumpGasToAdd).toBe(0);
    expect(result.ethanolToAdd).toBeGreaterThan(0);
    expect(result.totalFuelAfter).toBeCloseTo(15, 2);
  });
});
