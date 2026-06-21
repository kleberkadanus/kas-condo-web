import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getBookings, approveBooking, rejectBooking } from '../api/condos';
import { CheckCircle, XCircle, CalendarDays } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColor: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', cancelled: 'bg-gray-100 text-gray-500' };
const statusLabel: Record<string, string> = { pending: 'Pendente', approved: 'Aprovada', rejected: 'Rejeitada', cancelled: 'Cancelada' };

export default function ReservasPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const condoId = user?.condo_id;
  const canManage = ['sindico', 'superadmin'].includes(user?.role || '');

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', condoId],
    queryFn: () => getBookings(condoId!),
    enabled: !!condoId
  });

  const approve = useMutation({ mutationFn: approveBooking, onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Aprovada!'); } });
  const reject = useMutation({ mutationFn: rejectBooking, onSuccess: () => { qc.invalidateQueries({ queryKey: ['bookings'] }); toast.success('Rejeitada'); } });

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Espaço', 'Solicitante', 'Data/Hora', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.amenity?.name || `#${b.amenity_id}`}</td>
                  <td className="px-4 py-3 text-gray-600">{b.user?.name || `Usuário #${b.user_id}`}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(b.start_time).toLocaleDateString('pt-BR')} {new Date(b.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    {' — '}
                    {new Date(b.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || ''}`}>{statusLabel[b.status] || b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    {canManage && b.status === 'pending' && (
                      <div className="flex gap-1">
                        <button onClick={() => approve.mutate(b.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Aprovar"><CheckCircle size={16} /></button>
                        <button onClick={() => reject.mutate(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Rejeitar"><XCircle size={16} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
