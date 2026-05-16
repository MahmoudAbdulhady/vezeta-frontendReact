import axiosClient from './axiosClient';
import type {
  ILoginRequest, ILoginResponse,
  IPaginationRequest,
  IDoctorBookingDTO,
  IAddAppointmentDTO,
  IUpdateAppointmentDTO,
  IDoctorRegisterForm,
  IProfileDTO,
  IUpdateProfileDTO,
  ISpecializationDTO,
  IDoctorScheduleSlotDTO,
} from '../models';

export const getSpecializations = () =>
  axiosClient.get<ISpecializationDTO[]>('/api/Doctor/GetSpecializations');

export const doctorLogin = (data: ILoginRequest) =>
  axiosClient.post<ILoginResponse>('/api/Doctor/Login', data);

export const doctorRegister = (form: IDoctorRegisterForm) => {
  const fd = new FormData();
  fd.append('Email', form.email);
  fd.append('Password', form.password);
  fd.append('FirstName', form.firstName);
  fd.append('LastName', form.lastName);
  fd.append('Specialization', form.specialization);
  fd.append('PhoneNumber', form.phoneNumber);
  fd.append('DateOfBirth', form.dateOfBirth);
  fd.append('Gender', String(form.gender));
  if (form.imageUrl) fd.append('ImageUrl', form.imageUrl);
  return axiosClient.post('/api/Doctor/Register', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMyAppointments = (params: IPaginationRequest) =>
  axiosClient.get<{ appointments: IDoctorBookingDTO[]; totalCounts: number }>(
    '/api/Doctor/GetMyAppointments', { params }
  );

export const getMySchedule = () =>
  axiosClient.get<IDoctorScheduleSlotDTO[]>('/api/Doctor/GetMySchedule');

export const addAppointment = (data: IAddAppointmentDTO) =>
  axiosClient.post('/api/Doctor/AddAppointment', data);

export const deleteAppointment = (id: number) =>
  axiosClient.delete(`/api/Doctor/DeleteAppointment/${id}`);

export const updateAppointment = (id: number, data: IUpdateAppointmentDTO) =>
  axiosClient.put(`/api/Doctor/UpdateAppointment/${id}`, data);

export const confirmCheckup = (bookingId: number) =>
  axiosClient.post(`/api/Doctor/ConfirmCheckup/${bookingId}`);

export const getDoctorMyProfile = () =>
  axiosClient.get<IProfileDTO>('/api/Doctor/MyProfile');

export const updateDoctorMyProfile = (form: IUpdateProfileDTO) => {
  const fd = new FormData();
  fd.append('FirstName', form.firstName);
  fd.append('LastName', form.lastName);
  fd.append('PhoneNumber', form.phoneNumber);
  fd.append('Gender', String(form.gender));
  fd.append('DateOfBirth', form.dateOfBirth);
  if (form.imageUrl) fd.append('ImageUrl', form.imageUrl);
  return axiosClient.put('/api/Doctor/UpdateProfile', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
