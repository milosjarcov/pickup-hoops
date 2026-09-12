import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

// Context makes the logged-in user available to any component without
// passing props down every level. This is all the "state management" v1 needs.
//
// It also owns the sign-in prompt. Nothing in the app redirects to a login
// page: a component that needs a user calls requireAuth(), which either runs
// the action straight away or opens the modal and runs it once auth succeeds.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  // { reason, action } while the sign-in modal is open; null when it is closed.
  const [prompt, setPrompt] = useState(null);

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

  // Runs whatever the user was trying to do before we interrupted them.
  // The fresh token is handed over because `token` state is still stale here.
  async function finish(accessToken) {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
    const pending = prompt?.action;
    setPrompt(null);
    if (pending) await pending(accessToken);
  }

  async function login(email, password) {
    const { access_token } = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    await finish(access_token);
  }

  async function register(name, email, password) {
    const { access_token } = await api("/auth/register", {
      method: "POST",
      body: { name, email, password },
    });
    await finish(access_token);
  }

  /** One click into a shared demo account, for anyone who just wants a look. */
  async function loginAsDemo() {
    const { access_token } = await api("/auth/demo", { method: "POST" });
    await finish(access_token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
  }

  /**
   * Gate an action behind sign-in without losing it.
   * requireAuth("Join this run", (t) => join(t))
   */
  function requireAuth(reason, action) {
    if (token) {
      action(token);
      return;
    }
    setPrompt({ reason, action });
  }

  function openAuth(reason = null) {
    setPrompt({ reason, action: null });
  }

  // Stable identity: the modal keys an effect on this, and a new function
  // every render would re-run it and wipe the error the user is reading.
  const closeAuth = useCallback(() => setPrompt(null), []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        prompt,
        login,
        register,
        loginAsDemo,
        logout,
        requireAuth,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
