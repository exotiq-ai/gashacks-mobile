const { createClient } = require("@supabase/supabase-js");

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

function getBearerToken(event) {
  const authorization = event.headers.authorization || event.headers.Authorization || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed." });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { error: "Account deletion is not configured." });
  }

  const token = getBearerToken(event);
  if (!token) return json(401, { error: "Missing authorization token." });

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { error: "Invalid JSON body." });
  }
  if (payload.confirm !== true) {
    return json(400, { error: "Account deletion confirmation is required." });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return json(401, { error: "Invalid or expired session." });
  }

  const userId = userData.user.id;
  for (const table of ["fill_logs", "vehicles", "favorite_stations"]) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error) return json(500, { error: "Failed to delete account data." });
  }
  const { error: profileError } = await admin.from("profiles").delete().eq("id", userId);
  if (profileError) return json(500, { error: "Failed to delete profile." });

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return json(500, { error: "Failed to delete auth account." });

  return json(200, { success: true });
};
