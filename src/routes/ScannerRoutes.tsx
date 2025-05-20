import { Route, Routes } from "react-router-dom";
import Login from "../pages/scanner/ScannerLogin";
import Signup from "../pages/scanner/ScannerSignup";
import PrescriptionScanner from "../pages/scanner/PrescriptionScanner";
import { ThemeProvider } from "../components/theme-provider";

function ScannerRoutes() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PrescriptionScanner />} />
      </Routes>
    </ThemeProvider>
  );
}

export default ScannerRoutes;
