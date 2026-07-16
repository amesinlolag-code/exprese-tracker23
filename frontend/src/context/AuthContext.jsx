import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  loginRequest,
  registerRequest,
  googleAuthRequest,
  logoutRequest,
  profileRequest,
  updateProfileRequest,
} from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileRequest()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await loginRequest({ email, password });
    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await registerRequest({ name, email, password });
    setUser(res.data);
    return res.data;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const res = await googleAuthRequest(credential);
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await logoutRequest();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data) => {
    const res = await updateProfileRequest(data);
    setUser(res.data);
    return res.data;
  }, []);

  const refreshStatus = useCallback((status) => {
    setUser((prev) => (prev ? { ...prev, status } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, googleLogin, logout, updateProfile, refreshStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
