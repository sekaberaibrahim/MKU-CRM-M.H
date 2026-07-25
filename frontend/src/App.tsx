import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { RoomsPage } from "./pages/RoomsPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { ComplaintsPage } from "./pages/ComplaintsPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { LoyaltyPage } from "./pages/LoyaltyPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/reservations" element={<ReservationsPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/campaigns" element={<CampaignsPage />} />
            <Route path="/loyalty" element={<LoyaltyPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
