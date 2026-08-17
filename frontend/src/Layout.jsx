import { useNavigate, useLocation } from "react-router-dom";

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  let user = null;
  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      label: "Know Your Destination",
      path: "/know-destination",
      icon: "🌍",
    },
    {
      label: "Plan a Trip",
      path: "/plan-trip",
      icon: "🧭",
    },
    {
      label: "Create a Trip",
      path: "/create-trip",
      icon: "➕",
    },
    {
      label: "Account Profile",
      path: "/account",
      icon: "👤",
    },
    {
      label: "Settings & Specs",
      path: "/settings",
      icon: "⚙️",
    },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">

        {/* LOGO */}
        <div
          className="sidebar-logo"
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          🌴 Safar-E-Life
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={
                "sidebar-link" +
                (location.pathname === item.path
                  ? " active"
                  : "")
              }
              onClick={() => navigate(item.path)}
            >
              <span style={{ marginRight: "8px" }}>
                {item.icon}
              </span>

              {item.label}
            </div>
          ))}
        </nav>

        {/* USER */}
        <div
          className="sidebar-footer"
          onClick={handleLogout}
        >
          <span
            className="avatar"
            style={{
              backgroundColor: "#7b6ef6",
              width: "34px",
              height: "34px",
            }}
          >
            {user && user.name
              ? user.name.charAt(0).toUpperCase()
              : "?"}
          </span>

          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "13px",
              }}
            >
              {user && toTitleCase(user.name)}
            </div>

            <div
              style={{
                fontSize: "11px",
                color: "#8b93a6",
              }}
            >
              Logout
            </div>
          </div>
        </div>

      </aside>

      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;