import axios from 'axios';

const envApiBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const apiBaseUrl = envApiBase || '/api';
const apiOrigin = envApiBase ? envApiBase.replace(/\/api$/i, '') : '';

const API = axios.create({
  baseURL: apiBaseUrl,
});

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
});

let refreshPromise = null;
const AUTH_UPDATED_EVENT = 'auth:user-updated';

// Resolve uploaded media paths to usable browser URLs.
// Cloudinary URLs are already absolute and returned as-is.
// Legacy local paths (e.g. uploads/images/...) are resolved against API origin.
export const resolveMediaUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  const normalizedPath = value.startsWith('/') ? value : `/${value}`;
  return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
};

const emitAuthUpdate = (userInfo) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AUTH_UPDATED_EVENT, { detail: userInfo }));
};

const updateStoredTokens = ({ accessToken, refreshToken }) => {
  const existing = localStorage.getItem('userInfo');
  if (!existing) return null;

  try {
    const parsed = JSON.parse(existing);
    const normalizedAccessToken = accessToken || parsed?.accessToken || parsed?.token;
    const updatedUser = {
      ...parsed,
      token: normalizedAccessToken,
      accessToken: normalizedAccessToken,
    };

    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    emitAuthUpdate(updatedUser);
    return normalizedAccessToken;
  } catch {
    return null;
  }
};

const clearSession = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('refreshToken');
  emitAuthUpdate(null);
};

// Attach token to every request
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo);
      const authToken = parsed?.accessToken || parsed?.token;
      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }
    } catch {
      localStorage.removeItem('userInfo');
    }
  }
  return config;
});

// Auto-refresh access token once if it expired, then retry the original request.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = refreshClient
            .post('/auth/refresh-token', {
              refreshToken: storedRefreshToken,
            })
            .then(({ data }) => {
              const refreshedToken = updateStoredTokens({
                accessToken: data?.accessToken || data?.token,
                refreshToken: data?.refreshToken,
              });

              if (!refreshedToken) {
                throw new Error('Failed to persist refreshed token');
              }

              return refreshedToken;
            })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const accessToken = await refreshPromise;

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return API(originalRequest);
      } catch (refreshError) {
        const refreshStatus = refreshError?.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          clearSession();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
