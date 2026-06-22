import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (e) {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('alignnova_token'));
  const [role, setRole] = useState(() => localStorage.getItem('alignnova_role'));
  const [user, setUser] = useState(null);

  // Proactive check effect
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    const checkExpiration = () => {
      if (isTokenExpired(token)) {
        localStorage.removeItem('alignnova_token');
        localStorage.removeItem('alignnova_role');
        setToken(null);
        setRole(null);
        setUser(null);
        
        const isPublicPage = window.location.pathname.startsWith('/signin') ||
                             window.location.pathname.startsWith('/set-password') ||
                             window.location.pathname.startsWith('/request-activation') ||
                             window.location.pathname.startsWith('/forgot-password');
        
        if (!isPublicPage) {
          window.location.href = '/signin?expired=true';
        }
      }
    };

    // Check immediately
    checkExpiration();

    // Check periodically (every 15 seconds)
    const interval = setInterval(checkExpiration, 15000);

    // Check when window gets focus (user returns to the tab)
    window.addEventListener('focus', checkExpiration);

    // Fetch profile if not expired
    if (!isTokenExpired(token)) {
      fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
        })
        .then((data) => {
          if (data) setUser(data);
        })
        .catch(() => {});
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkExpiration);
    };
  }, [token]);

  // Reactive fetch interceptor effect
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        const isAuthEndpoint = url && (
          url.includes('/api/login') ||
          url.includes('/api/forgot-password') ||
          url.includes('/api/reset-password') ||
          url.includes('/api/set-password') ||
          url.includes('/api/request-activation')
        );

        if (!isAuthEndpoint) {
          localStorage.removeItem('alignnova_token');
          localStorage.removeItem('alignnova_role');
          setToken(null);
          setRole(null);
          setUser(null);

          const isPublicPage = window.location.pathname.startsWith('/signin') ||
                               window.location.pathname.startsWith('/set-password') ||
                               window.location.pathname.startsWith('/request-activation') ||
                               window.location.pathname.startsWith('/forgot-password');

          if (!isPublicPage) {
            window.location.href = '/signin?expired=true';
          }
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const login = (accessToken, userRole) => {
    localStorage.setItem('alignnova_token', accessToken);
    localStorage.setItem('alignnova_role', userRole);
    setToken(accessToken);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('alignnova_token');
    localStorage.removeItem('alignnova_role');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        user,
        setUser,
        isAuthenticated: !!token,
        isAdmin: role === 'admin',
        isHr: role === 'hr',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


