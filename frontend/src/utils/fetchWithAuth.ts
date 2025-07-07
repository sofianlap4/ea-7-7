type FetchWithAuthOptions = RequestInit & {
  headers?: Record<string, string>;
};

const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

async function fetchWithAuth(url: string, options: FetchWithAuthOptions = {}): Promise<Response> {
  let token = localStorage.getItem('token');
  const isFormData = options.body instanceof FormData;

  // Always use a plain object for headers so we can safely set/delete properties
  const headers: Record<string, string> = {
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (isFormData) {
    if ('Content-Type' in headers) {
      delete headers['Content-Type'];
    }
  } else {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  let res = await fetch(backendUrl + url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 || res.status === 403) {
    // Try to refresh token
    const refreshRes = await fetch(`${backendUrl}/auth/refresh-token`, {
      method: 'POST',
      credentials: 'include'
    });

    if (refreshRes.ok) {
      const data: { token: string } = await refreshRes.json();
      localStorage.setItem('token', data.token);

      // Update headers with new token
      const retryHeaders: Record<string, string> = {
        ...(options.headers ? (options.headers as Record<string, string>) : {}),
        Authorization: `Bearer ${data.token}`,
      };
      if (isFormData) {
        if ('Content-Type' in retryHeaders) {
          delete retryHeaders['Content-Type'];
        }
      } else {
        retryHeaders['Content-Type'] = retryHeaders['Content-Type'] || 'application/json';
      }

      // Retry original request with new token
      res = await fetch(backendUrl + url, {
        ...options,
        headers: retryHeaders,
        credentials: 'include',
      });
    }
  }

  // Handle non-JSON responses gracefully
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res;
  } else {
    const text = await res.text();
    return {
      ok: res.ok,
      status: res.status,
      json: async () => ({ error: text }),
    } as Response;
  }
}

export default fetchWithAuth;