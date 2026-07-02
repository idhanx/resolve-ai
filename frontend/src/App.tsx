import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResolveProvider } from './ResolveContext';
import { Login } from './pages/Login';
import { EmployeeModule } from './pages/EmployeeModule';
import { ManagerModule } from './pages/ManagerModule';
import { DepartmentHeadModule } from './pages/DepartmentHeadModule';
import { CEOModule } from './pages/CEOModule';

function App() {
  return (
    <ResolveProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/employee/*" element={<EmployeeModule />} />
          <Route path="/manager/*" element={<ManagerModule />} />
          <Route path="/cto/*" element={<DepartmentHeadModule />} />
          <Route path="/coo/*" element={<DepartmentHeadModule />} />
          <Route path="/ceo/*" element={<CEOModule />} />
          
          {/* Redirect base landing to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Fallback to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ResolveProvider>
  );
}

export default App;
