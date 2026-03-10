import { createContext, useContext, useState, useCallback } from 'react';
import { getUser, saveUser, clearUser, saveToken, clearToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());

  const login = useCallback((userData, token) => {
    saveToken(token);
    saveUser(userData);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    clearUser();
    setUser(null);
  }, []);

  const isRole = (role) => user?.role === role;
  const isSuperAdmin = () => isRole('SUPER_ADMIN');
  const isAdmin      = () => isRole('ADMIN') || isRole('SUPER_ADMIN');
  const isCustomer   = () => isRole('CUSTOMER');

  return (
    <AuthContext.Provider value={{ user, login, logout, isSuperAdmin, isAdmin, isCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
