const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions {
  method?: string;
  token?: string | null;
  body?: unknown;
  signal?: AbortSignal;
}

export async function apiClient<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', token, body, signal } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw Object.assign(new Error(error.error || 'Request failed'), {
      status: res.status,
      code: error.code,
      data: error,
    });
  }

  return res.json();
}

// Download ZIP
export async function downloadZip(
  code: string,
  codeType: string,
  title: string,
  token: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/generate/download`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code, codeType, title }),
  });

  if (!res.ok) throw new Error('Download failed');

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
