import { Route, Routes } from "react-router-dom";
import Login from "../pages/scanner/ScannerLogin";
import Signup from "../pages/scanner/ScannerSignup";
import PrescriptionScanner from "../pages/scanner/PrescriptionScanner";

function ScannerRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrescriptionScanner/>}/>
      </Routes>
    </div>
  );
}

export default ScannerRoutes;
