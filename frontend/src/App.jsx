import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Spinner from "./components/Spinner";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";

// The map page pulls in Leaflet and MapLibre, which is most of the app's
// JavaScript. Loading it lazily means the landing and sign-in pages don't
// wait for a map engine they don't use. Vite turns import() into its own file.
const MapPage = lazy(() => import("./pages/MapPage"));

function PageSpinner() {
  return (
    <div className="page-center">
      <Spinner />
    </div>
  );
}

// People with a real account have no reason to see the sign-in pages.
// Guests do: signing in properly is how they stop being a guest.
function SignedOutOnly({ children }) {
  const { user } = useAuth();
  if (user && !user.is_guest) return <Navigate to="/map" replace />;
  return children;
}

// Nothing here requires an account. The landing page and the map are open
// to everyone, which matters when the visitor is a recruiter with a minute
// to spare. The app asks you to sign in only when you join or post a run.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/map"
            element={
              <Suspense fallback={<PageSpinner />}>
                <MapPage />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <SignedOutOnly>
                <Login />
              </SignedOutOnly>
            }
          />
          <Route
            path="/register"
            element={
              <SignedOutOnly>
                <Register />
              </SignedOutOnly>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
