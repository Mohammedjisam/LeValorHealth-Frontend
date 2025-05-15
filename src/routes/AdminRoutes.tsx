import { Route, Routes } from "react-router-dom";
import Login from "../pages/admin/AdminLogin";
import Dashboard from "../pages/admin/Dashboard";
import AdminLayout from "../components/admin/AdminLayout";
import ReceptionistList from "../pages/admin/ReceptionistList";

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="/" element={<AdminLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
         <Route path="receptionist" element={<ReceptionistList />} />
        {/* <Route path="doctors" element={<DoctorList />} />
        <Route path="patients" element={<PatientList />} />
       
        <Route path="pdeo" element={<PdeoList />} /> */}
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
