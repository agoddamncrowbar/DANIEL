// src/libz/url.ts
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export function resolveImageUrl(path?: string) {
  if (!path) return "/placeholder.jpg"; // local fallback
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // If starts with '/', join with API_URL without double slash
  if (path.startsWith("/")) return `${API_URL}${path}`;
  // Otherwise, assume relative and prefix with API_URL and a slash
  return `${API_URL}/${path}`;
}
