export type SupabaseOAuthRedirectParams = {
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  error: string | null;
  errorDescription: string | null;
};

function firstParam(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value && value.trim().length > 0 ? value : null;
}

export function parseSupabaseOAuthRedirect(url: string): SupabaseOAuthRedirectParams {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.search);

  if (parsed.hash.startsWith("#")) {
    const hashParams = new URLSearchParams(parsed.hash.slice(1));
    hashParams.forEach((value, key) => {
      if (!params.has(key)) params.set(key, value);
    });
  }

  return {
    code: firstParam(params, "code"),
    accessToken: firstParam(params, "access_token"),
    refreshToken: firstParam(params, "refresh_token"),
    error: firstParam(params, "error"),
    errorDescription: firstParam(params, "error_description"),
  };
}
