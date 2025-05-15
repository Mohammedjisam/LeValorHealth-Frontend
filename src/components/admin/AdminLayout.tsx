// components/admin/AdminLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

const AdminLayout = () => {
  const location = useLocation();

  // Extract the sub-route after `/admin/`, e.g. 'dashboard' from '/admin/dashboard'
  const activePage = location.pathname.split("/")[2] || "dashboard";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} />
      <div className="flex-1">
        <Header title="Admin" />
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
