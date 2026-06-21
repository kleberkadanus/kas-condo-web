import { api } from './client';

export const getApartments = (condoId: number) => api.get(`/condos/${condoId}/apartments`).then(r => r.data);
export const createApartment = (condoId: number, data: any) => api.post(`/condos/${condoId}/apartments`, data).then(r => r.data);
export const updateApartment = (condoId: number, id: number, data: any) => api.put(`/condos/${condoId}/apartments/${id}`, data).then(r => r.data);
export const deleteApartment = (condoId: number, id: number) => api.delete(`/condos/${condoId}/apartments/${id}`);

export const getResidents = (condoId: number) => api.get(`/condos/${condoId}/residents`).then(r => r.data);
export const createResident = (condoId: number, data: any) => api.post(`/condos/${condoId}/residents`, data).then(r => r.data);
export const updateResident = (condoId: number, id: number, data: any) => api.put(`/condos/${condoId}/residents/${id}`, data).then(r => r.data);

export const getParkingSlots = (condoId: number) => api.get(`/condos/${condoId}/parking`).then(r => r.data);
export const createParkingSlot = (condoId: number, data: any) => api.post(`/condos/${condoId}/parking`, data).then(r => r.data);

export const getCameras = (condoId: number) => api.get(`/condos/${condoId}/cameras`).then(r => r.data);
export const createCamera = (condoId: number, data: any) => api.post(`/condos/${condoId}/cameras`, data).then(r => r.data);
export const updateCamera = (condoId: number, id: number, data: any) => api.put(`/condos/${condoId}/cameras/${id}`, data).then(r => r.data);
export const deleteCamera = (condoId: number, id: number) => api.delete(`/condos/${condoId}/cameras/${id}`);

export const getAnnouncements = (condoId: number) => api.get(`/announcements/?condo_id=${condoId}`).then(r => r.data);
export const createAnnouncement = (data: any) => api.post('/announcements/', data).then(r => r.data);
export const deleteAnnouncement = (id: number) => api.delete(`/announcements/${id}`);

export const getBoletos = (condoId: number) => api.get(`/boletos/?condo_id=${condoId}`).then(r => r.data);
export const uploadBoleto = (formData: FormData) => api.post('/boletos/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
export const markBoletoAsPaid = (id: number) => api.post(`/boletos/${id}/mark-paid`).then(r => r.data);

export const getAmenities = (condoId: number) => api.get(`/bookings/amenities?condo_id=${condoId}`).then(r => r.data);
export const getBookings = (condoId: number) => api.get(`/bookings/?condo_id=${condoId}`).then(r => r.data);
export const approveBooking = (id: number) => api.post(`/bookings/${id}/approve`).then(r => r.data);
export const rejectBooking = (id: number) => api.post(`/bookings/${id}/reject`).then(r => r.data);
