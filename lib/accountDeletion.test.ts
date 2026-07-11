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

  it("returns the server-provided deletion error when available", async () => {
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "https://api.gashacks.test/delete-account");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid or expired session." }),
      })),
    );

    const result = await deleteAccountWithToken("expired-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid or expired session.");
  });

  it("falls back to the response status when deletion error JSON is unavailable", async () => {
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "https://api.gashacks.test/delete-account");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 502,
        json: async () => {
          throw new Error("bad gateway");
        },
      })),
    );

    const result = await deleteAccountWithToken("session-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Account deletion failed: 502");
  });

  it("returns a user-facing error when the deletion request cannot reach the server", async () => {
    vi.stubEnv("EXPO_PUBLIC_ACCOUNT_DELETE_API_URL", "https://api.gashacks.test/delete-account");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    const result = await deleteAccountWithToken("session-token");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Account deletion failed. Check your connection and try again.");
  });
});
