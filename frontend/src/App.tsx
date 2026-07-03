import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResolveProvider } from './ResolveContext';
import { Login } from './pages/Login';
import { EmployeeModule } from './pages/EmployeeModule';
import { ManagerModule } from './pages/ManagerModule';
import { DepartmentHeadModule } from './pages/DepartmentHeadModule';
import { CEOModule } from './pages/CEOModule';
import { RequireAuth } from './components/RequireAuth';

function App() {
  return (
    <ResolveProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/employee/*"
            element={
              <RequireAuth allowedRoles={['Employee']}>
                <EmployeeModule />
              </RequireAuth>
            }
          />
          <Route
            path="/manager/*"
            element={
              <RequireAuth allowedRoles={['Manager']}>
                <ManagerModule />
              </RequireAuth>
            }
          />
          <Route
            path="/cto/*"
            element={
              <RequireAuth allowedRoles={['CTO']}>
                <DepartmentHeadModule />
              </RequireAuth>
            }
          />
          <Route
            path="/coo/*"
            element={
              <RequireAuth allowedRoles={['COO']}>
                <DepartmentHeadModule />
              </RequireAuth>
            }
          />
          <Route
            path="/ceo/*"
            element={
              <RequireAuth allowedRoles={['CEO']}>
                <CEOModule />
              </RequireAuth>
            }
          />
          
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
