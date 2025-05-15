import { BrowserRouter, Route ,Routes} from 'react-router-dom'
import AdminRoutes from './routes/AdminRoutes'
import ReceptionistRoutes from './routes/ReceptionistRoutes'
import ScannerRoutes from './routes/ScannerRoutes'

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path='/*'element={<ReceptionistRoutes/>}/>
        <Route path='/admin/*' element={<AdminRoutes/>}/>
        <Route path='/scanner/*' element={<ScannerRoutes/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
