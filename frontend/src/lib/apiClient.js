const API_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export async function apiFetch(path, options = {}) {
  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    let message = `Error ${response.status}`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
