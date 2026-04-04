import axiosClient from './axiosClient';
import type {
  ILoginRequest, ILoginResponse,
  IPaginationRequest,
  IPatientRegisterForm,
  IAppointmentDTO,
  IPatientBookingDTO,
  ICreateBookingDTO,
} from '../models';

export const patientLogin = (data: ILoginRequest) =>
  axiosClient.post<ILoginResponse>('/api/Patient/Login', data);

export const patientRegister = (form: IPatientRegisterForm) => {
  const fd = new FormData();
  fd.append('Email', form.email);
  fd.append('Password', form.password);
  fd.append('FirstName', form.firstName);
  fd.append('LastName', form.lastName);
  fd.append('PhoneNumber', form.phoneNumber);
  fd.append('DateOfBirth', form.dateOfBirth);
  fd.append('Gender', String(form.gender));
  if (form.imageUrl) fd.append('ImageUrl', form.imageUrl);
  return axiosClient.post('/api/Patient/Register', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDoctorAppointments = (params: IPaginationRequest) =>
  axiosClient.get<{ appointments: IAppointmentDTO[]; totalCounts: number }>(
    '/api/Patient/GetDoctorAppointments', { params }
  );

export const bookAppointment = (data: ICreateBookingDTO) => {
  const fd = new FormData();
  fd.append('AppointmentId', String(data.appointmentId));
  if (data.couponName) fd.append('CouponName', data.couponName);
  return axiosClient.post('/api/Patient/BookAppointment', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const cancelBooking = (bookingId: number) =>
  axiosClient.delete(`/api/Patient/CancelAppointment/${bookingId}`);

export const getMyBookings = () =>
  axiosClient.get<IPatientBookingDTO[]>('/api/Patient/MyBookings');
