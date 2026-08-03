import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ADMIN_ONLY, FRONT_DESK, MANAGEMENT, MARKETING_TEAM } from "../rbac";
import { Role } from "../types";

type NavItem = {
  to: string;
  label: string;
  roles?: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/customers", label: "Customers" },
  { to: "/reports", label: "Reports", roles: MANAGEMENT },
  { to: "/rooms", label: "Rooms", roles: FRONT_DESK },
  { to: "/reservations", label: "Reservations", roles: FRONT_DESK },
  { to: "/invoices", label: "Billing", roles: FRONT_DESK },
  { to: "/complaints", label: "Complaints", roles: FRONT_DESK },
  { to: "/campaigns", label: "Campaigns", roles: MARKETING_TEAM },
  { to: "/loyalty", label: "Loyalty", roles: MARKETING_TEAM },
  { to: "/staff", label: "Staff", roles: ADMIN_ONLY }
];

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: "A snapshot of how the property is performing" },
  "/customers": { title: "Customers", subtitle: "Guest profiles and contact details" },
  "/reports": { title: "Reports", subtitle: "Operational summaries and downloadable exports" },
  "/rooms": { title: "Rooms", subtitle: "Inventory, rates, and current status" },
  "/reservations": { title: "Reservations", subtitle: "Bookings from check-in to check-out" },
  "/invoices": { title: "Billing", subtitle: "Invoices and payments" },
  "/complaints": { title: "Complaints", subtitle: "Service recovery and guest issues" },
  "/campaigns": { title: "Campaigns", subtitle: "Marketing outreach to guest segments" },
  "/loyalty": { title: "Loyalty", subtitle: "Award and track guest loyalty points" },
  "/staff": { title: "Staff", subtitle: "Manage staff accounts and roles" }
};

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark">
            <img src="/brand/crest-charcoal.png" alt="" />
          </span>
          <div>
            <div className="sidebar__brand-title">The Manor Hotel</div>
            <div className="sidebar__brand-subtitle">CRM Suite</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__footer">
          <img className="sidebar__footer-banner" src="/brand/logo-banner-dark.png" alt="The Manor Hotel" />
          <span>Final Year Project</span>
        </div>
      </aside>

      <div className="main">
        <PageHeader onLogout={logout} userEmail={user?.email} userRole={user?.role} />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function PageHeader({
  onLogout,
  userEmail,
  userRole
}: {
  onLogout: () => void;
  userEmail?: string;
  userRole?: Role;
}) {
  const location = useLocation();
  const meta = PAGE_TITLES[location.pathname] ?? { title: "Manor Hotel CRM", subtitle: "" };

  return (
    <header className="topbar">
      <div>
        <div className="topbar__title">{meta.title}</div>
        <div className="topbar__subtitle">{meta.subtitle}</div>
      </div>
      <div className="topbar__user">
        <div>
          <div className="topbar__user-name">{userEmail}</div>
          <div className="topbar__user-role">{userRole}</div>
        </div>
        <button className="btn-secondary btn-sm" onClick={onLogout} type="button">
          Sign out
        </button>
      </div>
    </header>
  );
}
