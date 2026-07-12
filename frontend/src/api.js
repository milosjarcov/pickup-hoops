// One tiny fetch wrapper so every component talks to the API the same way.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // FastAPI puts error info in `detail`: a string for our HTTPExceptions,
    // or a list of field errors for validation failures.
    const detail = data?.detail;
    const message = Array.isArray(detail)
      ? detail.map((d) => d.msg).join(", ")
      : detail;
    throw new Error(message ?? `Request failed (${res.status})`);
  }
  return data;
}
