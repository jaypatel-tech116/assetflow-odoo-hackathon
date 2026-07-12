import { createContext, useContext, useState, useEffect } from 'react';
import { apiGet } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('assetflow_token');
      const storedUser = localStorage.getItem('assetflow_user');

      if (token && storedUser) {
        try {
          // Validate token by calling /auth/me
          const result = await apiGet('/auth/me');
          if (result.success && result.user) {
            setUser(result.user);
            localStorage.setItem('assetflow_user', JSON.stringify(result.user));
          } else {
            // Token invalid — clear
            localStorage.removeItem('assetflow_token');
            localStorage.removeItem('assetflow_user');
          }
        } catch {
          // On error, use cached user data
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('assetflow_token', token);
    localStorage.setItem('assetflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('assetflow_token');
    localStorage.removeItem('assetflow_user');
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('assetflow_user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
