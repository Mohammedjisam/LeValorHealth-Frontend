import React from "react";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  UserRound,
  UserCog,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";

interface SidebarProps {
  activePage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage }) => {
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, key: "dashboard" },
    { label: "Revenue", href: "/admin/revenue", icon: DollarSign, key: "revenue" },
    { label: "Doctors", href: "/admin/doctors", icon: Users, key: "doctors" },
    { label: "Patients", href: "/admin/patients", icon: UserRound, key: "patients" },
    { label: "Receptionist", href: "/admin/receptionist", icon: UserCog, key: "receptionist" },
    { label: "PDEO", href: "/admin/pdeo", icon: UserCheck, key: "pdeo" },
  ];

  return (
    <div className="w-[220px] min-h-screen bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center mb-2 mt-2">
          <img
            src="/MALABAR_ACADEMIC_CITY_HOSPITAL_LOGO_page-0001__1_-removebg-preview.png"
            alt="Hospital Logo"
            className="h-14 w-auto"
          />
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon, key }) => (
            <li key={key}>
              <button
                onClick={() => navigate(href)}
                className={clsx(
                  "flex items-center w-full px-3 py-2 rounded-md transition text-sm font-medium",
                  activePage === key
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon size={20} className="mr-2" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
