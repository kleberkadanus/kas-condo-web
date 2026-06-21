import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCondos, createCondo, updateCondo, deleteCondo } from '../api/admin';
import { Plus, Pencil, Trash2, Building2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const PLANS = ['basic', 'pro', 'enterprise'];

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function CondominiosPage() {
  const qc = useQueryClient();
  const { data: condos = [], isLoading } = useQuery({ queryKey: ['condos'], queryFn: getCondos });
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', slug: '', address: '', city: '', state: '', plan: 'basic' });

  const save = useMutation({
    mutationFn: () => selected ? updateCondo(selected.id, form) : createCondo(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['condos'] }); setModal(null); toast.success(selected ? 'Atualizado!' : 'Criado!'); },
    onError: () => toast.error('Erro ao salvar')
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteCondo(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['condos'] }); toast.success('Removido!'); },
    onError: () => toast.error('Erro ao remover')
  });

  const openCreate = () => { setSelected(null); setForm({ name: '', slug: '', address: '', city: '', state: '', plan: 'basic' }); setModal('create'); };
  const openEdit = (c: any) => { setSelected(c); setForm({ name: c.name, slug: c.slug, address: c.address || '', city: c.city || '', state: c.state || '', plan: c.plan }); setModal('edit'); };

  const planColor: Record<string, string> = { basic: 'bg-gray-100 text-gray-700', pro: 'bg-blue-100 text-blue-700', enterprise: 'bg-purple-100 text-purple-700' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{condos.length} condomínio(s)</p>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900">
          <Plus size={16} /> Novo Condomínio
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {condos.map((c: any) => (
            <div key={c.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 size={20} className="text-blue-700" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${planColor[c.plan] || planColor.basic}`}>{c.plan}</span>
              </div>
              <h3 className="font-semibold text-gray-900">{c.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{c.city}{c.state ? ` - ${c.state}` : ''}</p>
              <p className="text-xs text-gray-400">{c.address}</p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1 text-xs border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50">
                  <Pencil size={13} /> Editar
                </button>
                <button onClick={() => { if (confirm('Remover?')) remove.mutate(c.id); }}
                  className="flex items-center justify-center gap-1 text-xs border border-red-200 text-red-600 rounded-lg px-3 py-1.5 hover:bg-red-50">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'Novo Condomínio' : 'Editar Condomínio'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {(['name', 'slug', 'address', 'city', 'state'] as const).map(f => (
              <div key={f}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{f === 'slug' ? 'Identificador (slug)' : f}</label>
                <input value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Plano</label>
              <select value={form.plan} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50">Cancelar</button>
              <button onClick={() => save.mutate()} disabled={save.isPending}
                className="flex-1 bg-blue-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-900 disabled:opacity-60">
                {save.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
