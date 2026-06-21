import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getCondos, getUsers } from '../api/admin';
import { getResidents, getBoletos, getBookings } from '../api/condos';
import { Building2, Users, FileText, CalendarDays, TrendingUp, AlertCircle } from 'lucide-react';

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

import { ReactNode } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: condos } = useQuery({ queryKey: ['condos'], queryFn: getCondos, enabled: user?.role === 'superadmin' });
  const { data: allUsers } = useQuery({ queryKey: ['users'], queryFn: () => getUsers(), enabled: user?.role === 'superadmin' });
  const { data: residents } = useQuery({
    queryKey: ['residents', user?.condo_id],
    queryFn: () => getResidents(user!.condo_id!),
    enabled: !!user?.condo_id && user.role === 'sindico'
  });
  const { data: boletos } = useQuery({
    queryKey: ['boletos', user?.condo_id],
    queryFn: () => getBoletos(user!.condo_id!),
    enabled: !!user?.condo_id
  });
  const { data: bookings } = useQuery({
    queryKey: ['bookings', user?.condo_id],
    queryFn: () => getBookings(user!.condo_id!),
    enabled: !!user?.condo_id && ['sindico', 'morador'].includes(user.role)
  });

  const pendingBoletos = boletos?.filter((b: any) => b.status === 'pending')?.length ?? 0;
  const pendingBookings = bookings?.filter((b: any) => b.status === 'pending')?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Painel de controle do KAS Condomínio</p>
      </div>

      {user?.role === 'superadmin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Condomínios" value={condos?.length} icon={<Building2 size={22} className="text-white" />} color="bg-blue-600" />
          <StatCard label="Usuários Totais" value={allUsers?.length} icon={<Users size={22} className="text-white" />} color="bg-purple-600" />
          <StatCard label="Planos Ativos" value={condos?.filter((c: any) => c.active)?.length} icon={<TrendingUp size={22} className="text-white" />} color="bg-green-600" />
          <StatCard label="Planos Pro/Enterprise" value={condos?.filter((c: any) => ['pro','enterprise'].includes(c.plan))?.length} icon={<AlertCircle size={22} className="text-white" />} color="bg-orange-500" />
        </div>
      )}

      {user?.role === 'sindico' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Moradores" value={residents?.length} icon={<Users size={22} className="text-white" />} color="bg-blue-600" />
          <StatCard label="Boletos Pendentes" value={pendingBoletos} icon={<FileText size={22} className="text-white" />} color="bg-orange-500" />
          <StatCard label="Reservas Pendentes" value={pendingBookings} icon={<CalendarDays size={22} className="text-white" />} color="bg-purple-600" />
          <StatCard label="Total Boletos" value={boletos?.length} icon={<TrendingUp size={22} className="text-white" />} color="bg-green-600" />
        </div>
      )}

      {['morador', 'zelador'].includes(user?.role || '') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard label="Boletos Pendentes" value={pendingBoletos} icon={<FileText size={22} className="text-white" />} color="bg-orange-500" />
          <StatCard label="Minhas Reservas" value={bookings?.length ?? 0} icon={<CalendarDays size={22} className="text-white" />} color="bg-blue-600" />
        </div>
      )}

      {/* Últimos boletos pendentes */}
      {pendingBoletos > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Boletos Pendentes</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {boletos?.filter((b: any) => b.status === 'pending').slice(0, 5).map((b: any) => (
              <div key={b.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{b.description || `Boleto #${b.id}`}</p>
                  <p className="text-xs text-gray-400">Venc: {b.due_date ? new Date(b.due_date).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
                <span className="text-sm font-semibold text-orange-600">
                  {b.amount ? `R$ ${Number(b.amount).toFixed(2)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
