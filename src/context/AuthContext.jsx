import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserFromStorage = () => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      setUser(null);
      return;
    }

    try {
      const parsed = JSON.parse(userInfo);
      const normalizedToken = parsed?.accessToken || parsed?.token;
      if (normalizedToken) {
        setUser({ ...parsed, token: normalizedToken, accessToken: normalizedToken });
      } else {
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('userInfo');
      setUser(null);
    }
  };

  useEffect(() => {
    const handleAuthUpdated = () => syncUserFromStorage();

    syncUserFromStorage();
    window.addEventListener('auth:user-updated', handleAuthUpdated);
    window.addEventListener('storage', handleAuthUpdated);
    setLoading(false);

    return () => {
      window.removeEventListener('auth:user-updated', handleAuthUpdated);
      window.removeEventListener('storage', handleAuthUpdated);
    };
  }, []);

  const login = async (email, password, otp) => {
    const loginData = { email, password, otp };
    const { data } = await API.post('/auth/login', loginData);
    const normalizedToken = data.accessToken || data.token;
    const normalizedUser = { ...data, token: normalizedToken, accessToken: normalizedToken };
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(normalizedUser);
    return normalizedUser;
  };

  const register = async (name, email, password, otp) => {
    const registerData = { name, email, password, otp };
    const { data } = await API.post('/auth/register', registerData);
    const normalizedToken = data.accessToken || data.token;
    const normalizedUser = { ...data, token: normalizedToken, accessToken: normalizedToken };
    localStorage.setItem('userInfo', JSON.stringify(normalizedUser));
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    setUser(normalizedUser);
    return normalizedUser;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await API.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    localStorage.removeItem('userInfo');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: null }));
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return null;

      const { data } = await API.post('/auth/refresh-token', { refreshToken });
      
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo) {
        userInfo.token = data.accessToken;
        userInfo.accessToken = data.accessToken;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        setUser(userInfo);
        window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: userInfo }));
      }
      
      return data.accessToken;
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
      }
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

