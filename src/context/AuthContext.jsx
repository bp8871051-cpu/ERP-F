import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('erp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('erp_token'));
  const [companies, setCompanies] = useState([]);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Fetch active companies
        try {
          const compData = await authService.getCompanies();
          if (compData?.companies) {
            setCompanies(compData.companies);
            const savedCompId = localStorage.getItem('erp_company_id');
            const match = compData.companies.find(c => c.id === Number(savedCompId)) || compData.companies[0];
            setCurrentCompany(match || { id: 1, name: 'Falcon LLP' });
          }
        } catch {
          setCurrentCompany({ id: 1, name: 'Falcon LLP' });
        }

        if (token && !user) {
          const userData = await authService.getCurrentUser();
          if (userData?.user) {
            setUser(userData.user);
            localStorage.setItem('erp_user', JSON.stringify(userData.user));
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    return data;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_company_id');
    try {
      await authService.logout();
    } catch {
      // Ignored
    }
  };

  const switchCompany = (company) => {
    setCurrentCompany(company);
    localStorage.setItem('erp_company_id', company.id);
    // Reload active dashboard data
    window.location.reload();
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'Super Admin' || user.role === 'Admin') return true;
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      companies,
      currentCompany,
      isAuthenticated: !!token && !!user,
      loading,
      login,
      logout,
      switchCompany,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
