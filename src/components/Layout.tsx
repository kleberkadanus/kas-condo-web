import { type ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import {
  LayoutDashboard, Building2, Users, Bell, FileText,
  CalendarDays, Camera, LogOut, Menu, X
} from 'lucide-react';

interface NavItem { label: string; path: string; icon: ReactNode; roles: string[] }

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} />, roles: ['superadmin', 'sindico', 'zelador', 'morador'] },
  { label: 'Condomínios', path: '/condominios', icon: <Building2 size={18} />, roles: ['superadmin'] },
  { label: 'Usuários', path: '/usuarios', icon: <Users size={18} />, roles: ['superadmin'] },
  { label: 'Moradores', path: '/moradores', icon: <Users size={18} />, roles: ['sindico'] },
  { label: 'Avisos', path: '/avisos', icon: <Bell size={18} />, roles: ['superadmin', 'sindico', 'zelador', 'morador'] },
  { label: 'Boletos', path: '/boletos', icon: <FileText size={18} />, roles: ['superadmin', 'sindico', 'morador'] },
  { label: 'Reservas', path: '/reservas', icon: <CalendarDays size={18} />, roles: ['sindico', 'morador'] },
  { label: 'Câmeras', path: '/cameras', icon: <Camera size={18} />, roles: ['superadmin', 'sindico', 'zelador', 'morador'] },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filtered = navItems.filter(n => user && n.roles.includes(user.role));

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel: Record<string, string> = {
    superadmin: 'Super Admin', sindico: 'Síndico', zelador: 'Zelador', morador: 'Morador', portaria: 'Portaria'
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-blue-900 text-white flex flex-col transition-all duration-200 flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen && <span className="font-bold text-lg">KAS Condo</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-blue-200 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {filtered.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-sm font-medium
                ${location.pathname === item.path
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'}`}
            >
              {item.icon}
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-blue-800">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-blue-300">{roleLabel[user?.role || '']}</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={handleLogout} className="text-blue-300 hover:text-white">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="font-semibold text-gray-800">
              {filtered.find(n => n.path === location.pathname)?.label || 'KAS Condomínio'}
            </h2>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600">
            <LogOut size={16} /> Sair
          </button>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
