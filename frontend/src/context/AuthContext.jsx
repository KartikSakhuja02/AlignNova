import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getRequestAccessToken, isTokenExpired } from './authSession.js';

const AuthContext = createContext(null);
const publicPaths = new Set(['/', '/signin', '/set-password', '/request-activation', '/forgot-password']);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('alignnova_token'));
  const [role, setRole] = useState(() => localStorage.getItem('alignnova_role'));
  const [user, setUser] = useState(null);
  const activeToken = useRef(token);

  const logout = useCallback(() => {
    activeToken.current = null;
    localStorage.removeItem('alignnova_token');
    localStorage.removeItem('alignnova_role');
    setToken(null);
    setRole(null);
    setUser(null);
  }, []);

  const expireSession = useCallback((requestToken) => {
    if (!requestToken || requestToken !== activeToken.current) return;
    logout();
    const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
    if (currentPath === '/signin' || !publicPaths.has(currentPath)) {
      window.location.replace('/signin?expired=true');
    }
  }, [logout]);

  useEffect(() => {
    const originalFetch = window.fetch;
    async function fetchWithSessionCheck(input, init) {
      const requestToken = getRequestAccessToken(input, init, window.location.origin);
      const response = await originalFetch.call(window, input, init);
      if (response.status === 401) expireSession(requestToken);
      return response;
    }
    window.fetch = fetchWithSessionCheck;
    return () => {
      if (window.fetch === fetchWithSessionCheck) window.fetch = originalFetch;
    };
  }, [expireSession]);

  useEffect(() => {
    if (!token) return;
    const checkExpiration = () => {
      if (isTokenExpired(token)) expireSession(token);
    };
    if (isTokenExpired(token)) {
      expireSession(token);
      return;
    }

    const controller = new AbortController();
    fetch('/api/profile', {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (data && !controller.signal.aborted && activeToken.current === token) setUser(data);
      })
      .catch(() => {});

    const interval = window.setInterval(checkExpiration, 15_000);
    window.addEventListener('focus', checkExpiration);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener('focus', checkExpiration);
    };
  }, [token, expireSession]);

  const login = (accessToken, userRole) => {
    activeToken.current = accessToken;
    localStorage.setItem('alignnova_token', accessToken);
    localStorage.setItem('alignnova_role', userRole);
    setUser(null);
    setRole(userRole);
    setToken(accessToken);
  };

  return (
    <AuthContext.Provider value={{
      token, role, user, setUser, login, logout,
      isAuthenticated: !!token,
      isAdmin: role === 'admin',
      isHr: role === 'hr',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
