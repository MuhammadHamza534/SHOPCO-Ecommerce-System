import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuth";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UsersRound,
  Boxes,
  FolderTree,
  Mail,
  Settings,
  Tag,
  ChartNoAxesCombined,
  X,
} from "lucide-react";

const navigationItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    name: "Users",
    path: "/users",
    icon: UsersRound,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  { name: "Categories", path: "/categories", icon: FolderTree },
  { name: "Inventory", path: "/inventory", icon: Boxes },
  { name: "Coupons", path: "/coupons", icon: Tag },
  { name: "Newsletter", path: "/newsletter", icon: Mail },
  { name: "Reports", path: "/reports", icon: ChartNoAxesCombined },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({
  isOpen,
  isCollapsed,
  onClose,
}) {
  const { profile, logout } = useAdminAuth();
  const sidebarClassName = [
    "sidebar",
    isOpen ? "open" : "",
    isCollapsed ? "collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleNavigation() {
    onClose();
  }

  return (
    <>
      <button
        type="button"
        className={
          isOpen
            ? "sidebar-overlay visible"
            : "sidebar-overlay"
        }
        aria-label="Close navigation"
        onClick={onClose}
      />

      <aside className={sidebarClassName}>
        <div className="sidebar-header">
          <NavLink
            to="/"
            className="brand"
            aria-label="Berry dashboard home"
            onClick={handleNavigation}
          >
            <span className="brand-logo">
              <span />
            </span>

            <span className="brand-name">
              BERRY
            </span>
          </NavLink>

          <button
            type="button"
            className="sidebar-close"
            aria-label="Close sidebar"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        <div className="sidebar-content">
          <p className="sidebar-label">
            SHOP MANAGEMENT
          </p>

          <nav className="sidebar-navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/"}
                  title={
                    isCollapsed
                      ? item.name
                      : undefined
                  }
                  className={({ isActive }) =>
                    isActive
                      ? "sidebar-link active"
                      : "sidebar-link"
                  }
                  onClick={handleNavigation}
                >
                  <Icon size={20} />

                  <span className="sidebar-link-text">
                    {item.name}
                  </span>

                  <span className="sidebar-tooltip">
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-profile">
          <span className="profile-avatar">{profile?.full_name?.slice(0, 2).toUpperCase() || "AD"}</span>

          <div className="sidebar-profile-info">
            <strong>{profile?.full_name || "Administrator"}</strong>
            <small>{profile?.role?.replace("_", " ") || "Admin"}</small>
          </div>
          <button type="button" className="sidebar-logout" onClick={logout}>Log out</button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
