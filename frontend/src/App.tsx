import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleRoute } from "./components/RoleRoute";
import { Layout } from "./components/Layout";
import { ADMIN_ONLY, FRONT_DESK, MANAGEMENT, MARKETING_TEAM } from "./rbac";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { RoomsPage } from "./pages/RoomsPage";
import { ReservationsPage } from "./pages/ReservationsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { ComplaintsPage } from "./pages/ComplaintsPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { LoyaltyPage } from "./pages/LoyaltyPage";
import { StaffPage } from "./pages/StaffPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />

            <Route element={<RoleRoute roles={MANAGEMENT} />}>
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            <Route element={<RoleRoute roles={FRONT_DESK} />}>
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/reservations" element={<ReservationsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/complaints" element={<ComplaintsPage />} />
            </Route>

            <Route element={<RoleRoute roles={MARKETING_TEAM} />}>
              <Route path="/campaigns" element={<CampaignsPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
            </Route>

            <Route element={<RoleRoute roles={ADMIN_ONLY} />}>
              <Route path="/staff" element={<StaffPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
