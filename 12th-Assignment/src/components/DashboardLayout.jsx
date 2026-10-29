import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./HeaderLive";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  ] = useState(false);

  function handleMenuClick() {
    const isMobileScreen =
      window.innerWidth <= 800;

    if (isMobileScreen) {
      setIsSidebarOpen(true);
      return;
    }

    setIsSidebarCollapsed(
      (currentValue) => !currentValue
    );
  }

  function closeMobileSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <div
      className={
        isSidebarCollapsed
          ? "dashboard-layout sidebar-collapsed"
          : "dashboard-layout"
      }
    >
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={closeMobileSidebar}
      />

      <div className="dashboard-main">
        <Header onMenuClick={handleMenuClick} />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
