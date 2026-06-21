import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getBoletos, uploadBoleto, markBoletoAsPaid } from '../api/condos';
import { Upload, CheckCircle, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../api/client';

export default function BoletosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const condoId = user?.condo_id;
  const canUpload = ['sindico', 'superadmin'].includes(user?.role || '');

  const { data: boletos = [], isLoading } = useQuery({
    queryKey: ['boletos', condoId],
    queryFn: () => getBoletos(condoId!),
    enabled: !!condoId
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ description: '', amount: '', due_date: '', resident_id: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = useMutation({
    mutationFn: () => {
      const file = fileRef.current?.files?.[0];
      if (!file) throw new Error('Selecione um arquivo');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('description', form.description);
      fd.append('amount', form.amount);
      fd.append('due_date', form.due_date);
      if (form.resident_id) fd.append('resident_id', form.resident_id);
      fd.append('condo_id', String(condoId));
      return uploadBoleto(fd);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boletos'] }); setShowForm(false); toast.success('Boleto enviado!'); },
    onError: (e: any) => toast.error(e.message || 'Erro ao enviar')
  });

  const markPaid = useMutation({
    mutationFn: (id: number) => markBoletoAsPaid(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['boletos'] }); toast.success('Marcado como pago!'); }
  });

  const statusColor: Record<string, string> = { pending: 'bg-orange-100 text-orange-700', paid: 'bg-green-100 text-green-700', overdue: 'bg-red-100 text-red-700' };
  const statusLabel: Record<string, string> = { pending: 'Pendente', paid: 'Pago', overdue: 'Vencido' };

  return (
    <div className="space-y-4">
      {canUpload && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
            <Upload size={16} /> Upload Boleto
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Novo Boleto</h3>
          <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição (ex: Cond. Junho/2026)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Valor (R$)</label>
              <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Vencimento</label>
              <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Arquivo PDF</label>
            <input ref={fileRef} type="file" accept=".pdf"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={() => upload.mutate()} disabled={upload.isPending}
              className="flex-1 bg-blue-800 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">
              {upload.isPending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Descrição', 'Valor', 'Vencimento', 'Status', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {boletos.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{b.description || `Boleto #${b.id}`}</td>
                  <td className="px-4 py-3 text-gray-700">{b.amount ? `R$ ${Number(b.amount).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{b.due_date ? new Date(b.due_date).toLocaleDateString('pt-BR') : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[b.status] || ''}`}>{statusLabel[b.status] || b.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {b.file_url && (
                        <a href={`${API_BASE}${b.file_url}`} target="_blank" rel="noreferrer"
                          className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Baixar PDF">
                          <Download size={14} />
                        </a>
                      )}
                      {canUpload && b.status === 'pending' && (
                        <button onClick={() => markPaid.mutate(b.id)}
                          className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Marcar como pago">
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
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
