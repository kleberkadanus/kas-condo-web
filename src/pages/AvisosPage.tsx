import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../api/condos';
import { Plus, Trash2, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['geral', 'manutencao', 'seguranca', 'financeiro', 'lazer', 'reuniao'];
const catColor: Record<string, string> = { geral: 'bg-gray-100 text-gray-700', manutencao: 'bg-yellow-100 text-yellow-700', seguranca: 'bg-red-100 text-red-700', financeiro: 'bg-green-100 text-green-700', lazer: 'bg-blue-100 text-blue-700', reuniao: 'bg-purple-100 text-purple-700' };

export default function AvisosPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const condoId = user?.condo_id;
  const canManage = ['superadmin', 'sindico'].includes(user?.role || '');

  const { data: avisos = [], isLoading } = useQuery({
    queryKey: ['announcements', condoId],
    queryFn: () => getAnnouncements(condoId!),
    enabled: !!condoId
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', category: 'geral' });

  const create = useMutation({
    mutationFn: () => createAnnouncement({ ...form, condo_id: condoId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); setShowForm(false); setForm({ title: '', body: '', category: 'geral' }); toast.success('Aviso publicado!'); },
    onError: () => toast.error('Erro ao publicar')
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteAnnouncement(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['announcements'] }); toast.success('Removido!'); }
  });

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
            <Plus size={16} /> Novo Aviso
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
          <h3 className="font-semibold text-gray-800">Novo Aviso</h3>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Conteúdo do aviso..." rows={4}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={() => create.mutate()} disabled={create.isPending || !form.title}
              className="flex-1 bg-blue-800 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">
              {create.isPending ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : avisos.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum aviso publicado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {avisos.map((a: any) => (
            <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor[a.category] || catColor.geral}`}>{a.category}</span>
                    <span className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{a.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{a.body}</p>
                </div>
                {canManage && (
                  <button onClick={() => { if (confirm('Remover?')) remove.mutate(a.id); }}
                    className="text-gray-300 hover:text-red-500 flex-shrink-0">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
