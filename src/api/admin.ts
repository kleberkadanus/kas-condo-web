import { api } from './client';

export const getCondos = () => api.get('/admin/condos').then(r => r.data);
export const createCondo = (data: any) => api.post('/admin/condos', data).then(r => r.data);
export const updateCondo = (id: number, data: any) => api.put(`/admin/condos/${id}`, data).then(r => r.data);
export const deleteCondo = (id: number) => api.delete(`/admin/condos/${id}`);

export const getUsers = (condoId?: number) => api.get('/admin/users', { params: { condo_id: condoId } }).then(r => r.data);
export const createUser = (data: any) => api.post('/admin/users', data).then(r => r.data);
export const updateUser = (id: number, data: any) => api.put(`/admin/users/${id}`, data).then(r => r.data);
export const deleteUser = (id: number) => api.delete(`/admin/users/${id}`);
export const resetPassword = (id: number, password: string) => api.post(`/admin/users/${id}/reset-password`, { password });
