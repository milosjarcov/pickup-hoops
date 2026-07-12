import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

// Context makes the logged-in user available to any component without
// passing props down every level. This is all the "state management" v1 needs.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  // On page load (or token change), turn the stored token back into a user.
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    setLoading(true);
    api("/auth/me", { token })
      .then(setUser)
      .catch(() => {
        // Token expired or invalid — treat as logged out.
        localStorage.removeItem("token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function saveToken(t) {
    localStorage.setItem("token", t);
    setToken(t);
  }

  async function login(email, password) {
    const { access_token } = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    saveToken(access_token);
  }

  async function register(name, email, password) {
    const { access_token } = await api("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    saveToken(access_token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
