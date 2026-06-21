import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './store/auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CondominiosPage from './pages/CondominiosPage';
import UsuariosPage from './pages/UsuariosPage';
import AvisosPage from './pages/AvisosPage';
import BoletosPage from './pages/BoletosPage';
import ReservasPage from './pages/ReservasPage';
import CamerasPage from './pages/CamerasPage';
import MoradoresPage from './pages/MoradoresPage';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30000 } } });

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={
        <PrivateRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              {user?.role === 'superadmin' && <>
                <Route path="/condominios" element={<CondominiosPage />} />
                <Route path="/usuarios" element={<UsuariosPage />} />
              </>}
              {user?.role === 'sindico' && <Route path="/moradores" element={<MoradoresPage />} />}
              <Route path="/avisos" element={<AvisosPage />} />
              <Route path="/boletos" element={<BoletosPage />} />
              {['sindico', 'morador'].includes(user?.role || '') && <Route path="/reservas" element={<ReservasPage />} />}
              <Route path="/cameras" element={<CamerasPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
