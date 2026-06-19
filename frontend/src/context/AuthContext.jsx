import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('alignnova_token'));
  const [role, setRole] = useState(() => localStorage.getItem('alignnova_role'));

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
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        isAuthenticated: !!token,
        isAdmin: role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
