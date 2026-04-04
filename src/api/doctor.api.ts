import axiosClient from './axiosClient';
import type {
  ILoginRequest, ILoginResponse,
  IPaginationRequest,
  IDoctorBookingDTO,
  IAddAppointmentDTO,
  IUpdateAppointmentDTO,
} from '../models';

export const doctorLogin = (data: ILoginRequest) =>
  axiosClient.post<ILoginResponse>('/api/Doctor/Login', data);

export const getMyAppointments = (params: IPaginationRequest) =>
  axiosClient.get<{ appointments: IDoctorBookingDTO[]; totalCounts: number }>(
    '/api/Doctor/GetMyAppointments', { params }
  );

export const addAppointment = (data: IAddAppointmentDTO) =>
  axiosClient.post('/api/Doctor/AddAppointment', data);

export const deleteAppointment = (id: number) =>
  axiosClient.delete(`/api/Doctor/DeleteAppointment/${id}`);

export const updateAppointment = (id: number, data: IUpdateAppointmentDTO) =>
  axiosClient.put(`/api/Doctor/UpdateAppointment/${id}`, data);

export const confirmCheckup = (bookingId: number) =>
  axiosClient.post(`/api/Doctor/ConfirmCheckup/${bookingId}`);
