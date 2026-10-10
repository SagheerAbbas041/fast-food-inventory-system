import { useEffect, useState } from "react";
import titleLogo from "./titlelogo.png";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Utensils,
  ChefHat,
  ReceiptText,
  Users,
  Package,
  ShoppingCart,
  BarChart3,
  UserCog,
  DatabaseBackup,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  Armchair,
  Search,
  Bell,
} from "lucide-react";

import api from "./api";

import Dashboard from "./pages/Dashboard";
import Tables from "./pages/Tables";
import POS from "./pages/POS";
import Kitchen from "./pages/Kitchen";
import Orders from "./pages/Orders";
import Invoices from "./pages/Invoices";
import Customers from "./pages/Customers";
import MenuPage from "./pages/MenuPage";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import UsersPage from "./pages/UsersPage";
import Backup from "./pages/Backup";
import SettingsPage from "./pages/SettingsPage";
import Login from "./pages/Login";

const nav = [
  {
    section: "Main",
    items: [
      ["Dashboard", "/", "dashboard", LayoutDashboard],
      ["Tables", "/tables", "tables", Armchair],
      ["Kitchen", "/kitchen", "kitchen", ChefHat],
    ],
  },
  {
    section: "Sales",
    items: [
      ["Orders", "/orders", "orders", ReceiptText],
      ["Invoices", "/invoices", "invoices", ReceiptText],
      ["Customers", "/customers", "customers", Users],
    ],
  },
  {
    section: "Management",
    items: [
      ["Menu", "/menu", "menu", Utensils],
      ["Inventory", "/inventory", "inventory", Package],
      ["Purchase", "/purchases", "purchases", ShoppingCart],
      ["Reports", "/reports", "reports", BarChart3],
    ],
  },
  {
    section: "System",
    items: [
      ["Users", "/users", "admin", UserCog],
      ["Backup", "/backup", "admin", DatabaseBackup],
      ["Settings", "/settings", "settings", Settings],
    ],
  },
];

function Shell({ user, setUser }) {
  const [open, setOpen] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  };

  const allowed = (key) =>
    key === "admin"
      ? user?.role === "admin"
      : true;

  return (
    <div className="app-shell">
      {/* =================================================
          SIDEBAR
      ================================================= */}
      <aside
        className={`sidebar ${
          open ? "" : "collapsed"
        }`}
      >
        {/* ===============================================
            BRAND
        =============================================== */}
       <div className="brand">
  <div className="brand-logo">
    <img
      src={titleLogo}
      alt="Crave Corner"
      className="brand-logo-image"
    />
  </div>

  {open && (
    <div>
      <strong>
        Crave Corner
      </strong>

      <small>
        Fast Food
      </small>
    </div>
  )}
</div>

        {/* ===============================================
            PROFILE
        =============================================== */}
        <div className="profile">
          <div className="avatar">
            {user?.name?.slice(0, 1)}
          </div>

          {open && (
            <div>
              <strong>
                {user?.name}
              </strong>

              <small>
                {user?.role}
              </small>
            </div>
          )}
        </div>

        {/* ===============================================
            SCROLLABLE NAVIGATION
        =============================================== */}

        <div
          className="sidebar-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            paddingRight: "4px",
          }}
        >
          <nav>
            {nav.map((group) => (
              <div
                className="nav-group"
                key={group.section}
              >
                <small className="nav-title">
                  {open &&
                    group.section}
                </small>

                {group.items
                  .filter((x) =>
                    allowed(x[2])
                  )
                  .map(
                    ([
                      label,
                      to,
                      key,
                      Icon,
                    ]) => (
                      <Link
                        key={key}
                        to={to}
                        className={`nav-link ${
                          location.pathname ===
                          to
                            ? "active"
                            : ""
                        }`}
                      >
                        <Icon
                          size={18}
                        />

                        {open && (
                          <span>
                            {label}
                          </span>
                        )}
                      </Link>
                    )
                  )}
              </div>
            ))}
          </nav>
        </div>

        {/* ===============================================
            LOGOUT
        =============================================== */}
        <button
          className="logout"
          onClick={logout}
        >
          <LogOut size={18} />

          {open && "Logout"}
        </button>
      </aside>

      {/* =================================================
          MAIN AREA
      ================================================= */}

      <main className="main-area">
        {/* ===============================================
            TOP BAR
        =============================================== */}

        <header className="topbar">
          <button
            className="icon-btn"
            onClick={() =>
              setOpen(!open)
            }
          >
            {open ? (
              <X size={20} />
            ) : (
              <MenuIcon size={20} />
            )}
          </button>

          <div className="top-title">
            {location.pathname ===
            "/"
              ? "Dashboard"
              : location.pathname
                  .slice(1)
                  .replaceAll(
                    "-",
                    " "
                  )}
          </div>

          <div className="top-actions">
            <div className="search-mini">
              <Search size={16} />

              <input
                placeholder="Quick search"
              />
            </div>

            <Bell size={19} />
          </div>
        </header>

        {/* ===============================================
            PAGE CONTENT
        =============================================== */}

        <div className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/tables"
              element={<Tables />}
            />

            <Route
              path="/tables/:tableId/order"
              element={<POS />}
            />

            <Route
              path="/kitchen"
              element={<Kitchen />}
            />

            <Route
              path="/orders"
              element={<Orders />}
            />

            <Route
              path="/invoices"
              element={<Invoices />}
            />

            <Route
              path="/customers"
              element={<Customers />}
            />

            <Route
              path="/menu"
              element={<MenuPage />}
            />

            <Route
              path="/inventory"
              element={<Inventory />}
            />

            <Route
              path="/purchases"
              element={<Purchases />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/users"
              element={<UsersPage />}
            />

            <Route
              path="/backup"
              element={<Backup />}
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem(
        "token"
      );

    if (token) {
      api
        .get("/auth/me")
        .then((r) =>
          setUser(r.data)
        )
        .catch(() =>
          localStorage.clear()
        )
        .finally(() =>
          setLoading(false)
        );
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={setUser}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Shell
      user={user}
      setUser={setUser}
    />
  );
}