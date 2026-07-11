import { describe, expect, it } from "vitest";
import { parseSupabaseOAuthRedirect } from "./oauthRedirect";

describe("parseSupabaseOAuthRedirect", () => {
  it("reads PKCE auth codes from redirect query params", () => {
    const params = parseSupabaseOAuthRedirect("gashacksmobile://auth?code=auth-code-123");

    expect(params.code).toBe("auth-code-123");
    expect(params.accessToken).toBeNull();
  });

  it("reads implicit tokens from redirect hash params", () => {
    const params = parseSupabaseOAuthRedirect(
      "gashacksmobile://auth#access_token=access-token&refresh_token=refresh-token",
    );

    expect(params.accessToken).toBe("access-token");
    expect(params.refreshToken).toBe("refresh-token");
  });

  it("preserves provider errors from redirects", () => {
    const params = parseSupabaseOAuthRedirect(
      "gashacksmobile://auth?error=access_denied&error_description=User%20cancelled",
    );

    expect(params.error).toBe("access_denied");
    expect(params.errorDescription).toBe("User cancelled");
  });
});
