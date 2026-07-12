import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MapPage from "./pages/MapPage";

// Wrap any route that needs a logged-in user.
function Protected({ children }) {
  const { token, loading } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (loading) return <p className="center-msg">Loading…</p>;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <Protected>
                <MapPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
