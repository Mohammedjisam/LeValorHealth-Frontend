import { Route, Routes } from "react-router-dom"
import Login from "../pages/receptionist/ReceptionistLogin"
import Signup from "../pages/receptionist/ReceptionistSignup"
import PatientRegistrationForm from "../pages/receptionist/PatientRegistrationForm"
import PatientRegistrationPage from "../pages/receptionist/PatientRegistrationPage"


function ReceptionistRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path='/signup' element={<Signup/>}/>
        <Route path='/dashboard' element={<PatientRegistrationForm/>}/>
        <Route path="/page" element={<PatientRegistrationPage/>}/>
      </Routes>
    </div>
  )
}

export default ReceptionistRoutes
