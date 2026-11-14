import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setCsrfToken } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the session check finishes

  // Restore session on page load using the HTTP-only cookie
  useEffect(() => {
    api.get('/user/me').then((res) => { setCsrfToken(res.data.data.csrfToken); setUser(res.data.data.user); }).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setCsrfToken(res.data.data.csrfToken);
    setUser(res.data.data.user);
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } finally { setCsrfToken(''); setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
