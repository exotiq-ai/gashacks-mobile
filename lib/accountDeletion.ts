import { getRuntimeConfig } from "./runtimeConfig";

type DeleteAccountResult = {
  success: boolean;
  error?: string;
};

function getAccountDeleteApiUrl() {
  const configured = getRuntimeConfig().accountDeleteApiUrl;
  if (configured) return configured;
  return typeof window !== "undefined" ? "/.netlify/functions/delete-account" : "";
}

export async function deleteAccountWithToken(accessToken: string): Promise<DeleteAccountResult> {
  const apiUrl = getAccountDeleteApiUrl();
  if (!apiUrl) {
    return {
      success: false,
      error: "Account deletion is not configured.",
    };
  }

  let response: Response;
  try {
    response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirm: true }),
    });
  } catch {
    return {
      success: false,
      error: "Account deletion failed. Check your connection and try again.",
    };
  }

  if (response.ok) return { success: true };

  let message = `Account deletion failed: ${response.status}`;
  try {
    const body = await response.json() as { error?: string };
    if (body.error) message = body.error;
  } catch {
    // Keep the status-based fallback.
  }

  return { success: false, error: message };
}
