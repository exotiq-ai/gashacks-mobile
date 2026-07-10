const NREL_BASE_URL = "https://developer.nrel.gov/api/alt-fuel-stations/v1.json";
const MAX_LIMIT = 100;
const MAX_RADIUS = 100;

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers,
    body: JSON.stringify(body),
  };
}

function clampNumber(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return String(Math.min(parsed, max));
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  const apiKey = process.env.NREL_API_KEY;
  if (!apiKey) return json(500, { error: "Station lookup is not configured." });

  const input = event.queryStringParameters ?? {};
  const params = new URLSearchParams({
    api_key: apiKey,
    fuel_type: "E85",
    radius: clampNumber(input.radius, "25", MAX_RADIUS),
    limit: clampNumber(input.limit, "50", MAX_LIMIT),
  });

  if (input.latitude && input.longitude) {
    params.set("latitude", input.latitude);
    params.set("longitude", input.longitude);
  } else if (input.location) {
    params.set("location", input.location);
  } else {
    return json(400, { error: "Provide latitude/longitude or location." });
  }

  const response = await fetch(`${NREL_BASE_URL}?${params.toString()}`);
  if (!response.ok) return json(response.status, { error: "Station lookup failed." });

  const data = await response.json();
  return json(200, data);
};
