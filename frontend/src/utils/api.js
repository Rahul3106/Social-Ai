// File: src/utils/api.js
// Helper that automatically attaches JWT token to every request

const getToken = () => localStorage.getItem("socialai_token");

export async function apiFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  return res;
}