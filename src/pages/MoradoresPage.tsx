import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { getResidents, createResident, updateResident } from '../api/condos';
import { Plus, Pencil, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function MoradoresPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const condoId = user?.condo_id!;
  const { data: residents = [], isLoading } = useQuery({ queryKey: ['residents', condoId], queryFn: () => getResidents(condoId) });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', apt_number: '', sip_user: '', sip_password: '', password: '' });

  const save = useMutation({
    mutationFn: () => selected ? updateResident(condoId, selected.id, form) : createResident(condoId, { ...form, role: 'morador', condo_id: condoId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['residents'] }); setModal(false); toast.success(selected ? 'Atualizado!' : 'Criado!'); },
    onError: () => toast.error('Erro ao salvar')
  });

  const openCreate = () => { setSelected(null); setForm({ name: '', email: '', apt_number: '', sip_user: '', sip_password: '', password: '' }); setModal(true); };
  const openEdit = (r: any) => { setSelected(r); setForm({ name: r.name, email: r.email, apt_number: r.apt_number || '', sip_user: r.sip_user || '', sip_password: r.sip_password || '', password: '' }); setModal(true); };

  const filtered = residents.filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase()) || (r.apt_number || '').includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar morador ou apt..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 ml-auto">
          <Plus size={16} /> Novo Morador
        </button>
      </div>

      {isLoading ? <div className="text-center py-12 text-gray-400">Carregando...</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nome', 'E-mail', 'Apt', 'Ramal SIP', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.email}</td>
                  <td className="px-4 py-3 text-gray-600">{r.apt_number || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{r.sip_user || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={selected ? 'Editar Morador' : 'Novo Morador'} onClose={() => setModal(false)}>
          <div className="space-y-3">
            {[{ k: 'name', l: 'Nome' }, { k: 'email', l: 'E-mail' }, { k: 'apt_number', l: 'Apartamento' }, { k: 'sip_user', l: 'Ramal SIP' }, { k: 'sip_password', l: 'Senha SIP' }].map(({ k, l }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            {!selected && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha inicial</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancelar</button>
              <button onClick={() => save.mutate()} disabled={save.isPending}
                className="flex-1 bg-blue-800 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">
                {save.isPending ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
