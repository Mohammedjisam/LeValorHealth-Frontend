import { Route, Routes } from "react-router-dom";
import Login from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import AdminLayout from "../components/admin/AdminLayout";
import ReceptionistList from "../pages/admin/ReceptionistList";
import PdeoList from "../pages/admin/PdeoList";
import DoctorList from "../pages/admin/DoctorList";
import { ThemeProvider } from "../components/theme-provider";
import PatientList from "../pages/admin/PatientList";

function AdminRoutes() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Routes>
        <Route index element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="receptionist" element={<ReceptionistList />} />
          <Route path="pdeo" element={<PdeoList />} />
          <Route path="doctors" element={<DoctorList />} />
          <Route path="patients" element={<PatientList />} />
         
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default AdminRoutes;
