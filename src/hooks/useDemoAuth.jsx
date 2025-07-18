import { createContext, useContext, useState, useEffect } from 'react';

const DemoAuthContext = createContext();

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};

export const DemoAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initAuth = () => {
      const demoUser = localStorage.getItem('demoUser');
      const demoMode = localStorage.getItem('demoMode');

      if (demoUser && demoMode === 'true') {
        const userData = JSON.parse(demoUser);
        setUser(userData);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    // Demo login - just store user data
    const userData = {
      id: Date.now().toString(),
      name: credentials.name,
      email: credentials.email || `${credentials.name}@demo.com`,
      role: credentials.role || 'student'
    };

    localStorage.setItem('demoUser', JSON.stringify(userData));
    localStorage.setItem('demoMode', 'true');
    setUser(userData);
    setIsAuthenticated(true);

    return { success: true, user: userData };
  };

  const register = async (userData) => {
    // Demo register - same as login
    return await login(userData);
  };

  const logout = () => {
    localStorage.removeItem('demoUser');
    localStorage.removeItem('demoMode');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <DemoAuthContext.Provider value={value}>
      {children}
    </DemoAuthContext.Provider>
  );
};
