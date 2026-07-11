import { describe, expect, it } from "vitest";
import type { ConfigContext } from "expo/config";
import createExpoConfig from "../app.config";

describe("app native config", () => {
  const config = createExpoConfig({
    config: {},
    projectRoot: process.cwd(),
    staticConfigPath: null,
    packageJsonPath: "package.json",
  } as ConfigContext);

  it("keeps store bundle identifiers aligned", () => {
    expect(config.scheme).toBe("gashacksmobile");
    expect(config.ios?.bundleIdentifier).toBe("com.exotiq.gashacks");
    expect(config.android?.package).toBe("com.exotiq.gashacks");
  });

  it("declares iOS permission usage strings for store review", () => {
    expect(config.ios?.infoPlist).toMatchObject({
      NSCameraUsageDescription: expect.stringContaining("scan fuel receipts"),
      NSLocationWhenInUseUsageDescription: expect.stringContaining("nearby E85 stations"),
      NSPhotoLibraryUsageDescription: expect.stringContaining("fuel receipt images"),
    });
  });

  it("blocks Android permissions the app does not need", () => {
    expect(config.android?.blockedPermissions).toEqual(
      expect.arrayContaining([
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.RECORD_AUDIO",
      ]),
    );
  });
});
