import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser, resetPassword } from '../api/admin';
import { getCondos } from '../api/admin';
import { Plus, Pencil, Trash2, Key, X, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['superadmin', 'sindico', 'zelador', 'morador', 'portaria'];
const roleLabel: Record<string, string> = { superadmin: 'Super Admin', sindico: 'Síndico', zelador: 'Zelador', morador: 'Morador', portaria: 'Portaria' };
const roleColor: Record<string, string> = { superadmin: 'bg-purple-100 text-purple-700', sindico: 'bg-blue-100 text-blue-700', zelador: 'bg-green-100 text-green-700', morador: 'bg-gray-100 text-gray-700', portaria: 'bg-orange-100 text-orange-700' };

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function UsuariosPage() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: () => getUsers() });
  const { data: condos = [] } = useQuery({ queryKey: ['condos'], queryFn: getCondos });
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<null | 'create' | 'edit' | 'password'>(null);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'morador', condo_id: '', apt_number: '', sip_user: '', sip_password: '' });
  const [newPassword, setNewPassword] = useState('');

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, condo_id: form.condo_id ? Number(form.condo_id) : null };
      return selected ? updateUser(selected.id, payload) : createUser(payload);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); toast.success(selected ? 'Atualizado!' : 'Criado!'); },
    onError: () => toast.error('Erro ao salvar')
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Removido!'); },
  });

  const changePwd = useMutation({
    mutationFn: () => resetPassword(selected.id, newPassword),
    onSuccess: () => { setModal(null); toast.success('Senha alterada!'); },
    onError: () => toast.error('Erro ao alterar senha')
  });

  const openCreate = () => { setSelected(null); setForm({ name: '', email: '', password: '', role: 'morador', condo_id: '', apt_number: '', sip_user: '', sip_password: '' }); setModal('create'); };
  const openEdit = (u: any) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role, condo_id: u.condo_id || '', apt_number: u.apt_number || '', sip_user: u.sip_user || '', sip_password: u.sip_password || '' }); setModal('edit'); };
  const openPwd = (u: any) => { setSelected(u); setNewPassword(''); setModal('password'); };

  const filtered = users.filter((u: any) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar usuário..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 ml-auto">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Nome', 'E-mail', 'Role', 'Condomínio', 'Apt', 'Ações'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${roleColor[u.role] || ''}`}>{roleLabel[u.role] || u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{condos.find((c: any) => c.id === u.condo_id)?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{u.apt_number || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded hover:bg-blue-50 text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => openPwd(u)} className="p-1.5 rounded hover:bg-yellow-50 text-yellow-600"><Key size={14} /></button>
                      <button onClick={() => { if (confirm('Remover?')) remove.mutate(u.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <Modal title={modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'} onClose={() => setModal(null)}>
          <div className="space-y-3">
            {[{ k: 'name', l: 'Nome' }, { k: 'email', l: 'E-mail' }].map(({ k, l }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            {modal === 'create' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Senha</label>
                <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {ROLES.map(r => <option key={r} value={r}>{roleLabel[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Condomínio</label>
              <select value={form.condo_id} onChange={e => setForm(p => ({ ...p, condo_id: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Nenhum —</option>
                {condos.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {[{ k: 'apt_number', l: 'Apartamento' }, { k: 'sip_user', l: 'Ramal SIP' }, { k: 'sip_password', l: 'Senha SIP' }].map(({ k, l }) => (
              <div key={k}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
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

      {modal === 'password' && (
        <Modal title={`Alterar senha — ${selected?.name}`} onClose={() => setModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nova Senha</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 rounded-lg py-2 text-sm">Cancelar</button>
              <button onClick={() => changePwd.mutate()} disabled={changePwd.isPending || !newPassword}
                className="flex-1 bg-blue-800 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-60">
                {changePwd.isPending ? 'Salvando...' : 'Alterar'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
