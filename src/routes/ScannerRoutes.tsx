import { Route, Routes } from "react-router-dom";
import Login from "../pages/scanner/ScannerLogin";
import Signup from "../pages/scanner/ScannerSignup";

function ScannerRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
}

export default ScannerRoutes;
