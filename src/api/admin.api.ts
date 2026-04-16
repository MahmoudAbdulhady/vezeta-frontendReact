import axiosClient from './axiosClient';
import type {
  ILoginRequest, ILoginResponse,
  IPaginationRequest,
  IDoctorDTO, IPatientDTO,
  ITopSpecialization, ITopDoctor, IRequestsDTO,
  IDoctorRegisterForm,
  IProfileDTO,
  IUpdateProfileDTO,
  ISpecializationDTO,
} from '../models';

// ─── Admin Login (via Doctor endpoint used by admin role) ────────────────────
export const adminLogin = (data: ILoginRequest) =>
  axiosClient.post<ILoginResponse>('/api/Doctor/Login', data);

// ─── Doctors ─────────────────────────────────────────────────────────────────
export const getAllDoctors = (params: IPaginationRequest) =>
  axiosClient.get<{ doctors: IDoctorDTO[]; totalCount: number }>('/api/Admin/GetAllDoctors', { params });

export const getDoctorById = (id: number) =>
  axiosClient.get<IDoctorDTO>(`/api/Admin/GetDoctorById/${id}`);

export const addDoctor = (form: IDoctorRegisterForm) => {
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
  return axiosClient.post('/api/Admin/AddDoctor', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteDoctorById = (id: number) =>
  axiosClient.delete(`/api/Admin/DeleteDoctorById/${id}`);

export const getNumOfDoctors = () =>
  axiosClient.get<{ totalDoctors: number }>('/api/Admin/NumOfDoctors');

export const getNumOfDoctorsLast24h = () =>
  axiosClient.get<{ doctorsAddedLast24Hours: number }>('/api/Admin/NumOfDoctorsInTheLast24Hours');

// ─── Patients ────────────────────────────────────────────────────────────────
export const getAllPatients = (params: IPaginationRequest) =>
  axiosClient.get<{ patients: IPatientDTO[]; totalPatients: number }>('/api/Admin/GetAllPatients', { params });

export const getPatientById = (id: string) =>
  axiosClient.get<IPatientDTO>(`/api/Admin/GetPatientById/${id}`);

export const getTotalPatients = () =>
  axiosClient.get<{ totalPatients: number }>('/api/Admin/TotalNumberOfPatients');

// ─── Stats ───────────────────────────────────────────────────────────────────
export const getTopSpecializations = () =>
  axiosClient.get<ITopSpecialization[]>('/api/Admin/TopFiveSpecializations');

export const getTopDoctors = () =>
  axiosClient.get<ITopDoctor[]>('/api/Admin/TopTenDoctors');

export const getRequestStats = () =>
  axiosClient.get<IRequestsDTO>('/api/Admin/GetNumberOfRequests');

// ─── Specializations ─────────────────────────────────────────────────────────
export const getAllSpecializations = () =>
  axiosClient.get<ISpecializationDTO[]>('/api/Admin/GetAllSpecializations');

export const addSpecialization = (name: string) =>
  axiosClient.post<ISpecializationDTO>('/api/Admin/AddSpecialization', JSON.stringify(name), {
    headers: { 'Content-Type': 'application/json' },
  });

export const deleteSpecialization = (id: number) =>
  axiosClient.delete(`/api/Admin/DeleteSpecialization/${id}`);

export const getAdminMyProfile = () =>
  axiosClient.get<IProfileDTO>('/api/Admin/MyProfile');

export const updateAdminMyProfile = (form: IUpdateProfileDTO) => {
  const fd = new FormData();
  fd.append('FirstName', form.firstName);
  fd.append('LastName', form.lastName);
  fd.append('PhoneNumber', form.phoneNumber);
  fd.append('Gender', String(form.gender));
  fd.append('DateOfBirth', form.dateOfBirth);
  if (form.imageUrl) fd.append('ImageUrl', form.imageUrl);
  return axiosClient.put('/api/Admin/UpdateProfile', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
