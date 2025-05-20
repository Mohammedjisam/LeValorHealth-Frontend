import { Route, Routes } from "react-router-dom"
import Login from "../pages/receptionist/ReceptionistLogin"
import Signup from "../pages/receptionist/ReceptionistSignup"
import PatientRegistrationPage from "../pages/receptionist/PatientRegistrationPage"
import { ThemeProvider } from "../components/theme-provider"
import PatientDetails from "../pages/receptionist/PatientDetails"

function ReceptionistRoutes() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<PatientRegistrationPage />} />
        <Route path="/viewdetails/:id" element={<PatientDetails/>}/>
      </Routes>
    </ThemeProvider>
  )
}

export default ReceptionistRoutes
