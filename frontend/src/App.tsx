import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { Monitoring } from './pages/Monitoring';
import { Infrastructure } from './pages/Infrastructure';
import { Security } from './pages/Security';
import { Storage } from './pages/Storage';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="apps" element={<Applications />} />
          <Route path="monitoring" element={<Monitoring />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          <Route path="security" element={<Security />} />
          <Route path="storage" element={<Storage />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
