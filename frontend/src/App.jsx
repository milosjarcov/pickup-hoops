import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import MapPage from "./pages/MapPage";

// No protected routes: the map, the courts and every posted run are public.
// Signing in is prompted inline (see AuthContext.requireAuth) only when a
// visitor actually tries to post, join or leave. The catch-all sends the old
// /login and /register URLs back to the map rather than 404ing.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
