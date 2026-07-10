import { afterEach, describe, expect, it, vi } from "vitest";
import { deleteAccountWithToken } from "./accountDeletion";

describe("deleteAccountWithToken", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("posts the current access token to the configured deletion endpoint", async () => {
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "https://api.gashacks.test/delete-account");
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({}),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deleteAccountWithToken("session-token");

    expect(result.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.gashacks.test/delete-account",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer session-token",
        }),
      }),
    );
  });

  it("returns a setup error when native account deletion is not configured", async () => {
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "");

    const result = await deleteAccountWithToken("session-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Account deletion is not configured.");
  });
});
