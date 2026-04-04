// ─── Auth ───────────────────────────────────────────────────────────────────
export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  token: string;
  message: string;
}

export type UserRole = 'Admin' | 'Doctor' | 'Patient';

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface IPaginationRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
export interface IDoctorDTO {
  email: string;
  fullName: string;
  specilization: string;
  phoneNumber: string;
  dateOfBirth: string;
  imageUrl: string;
  gender: string;
}

export interface IPatientDTO {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  imageUrl: string;
  gender: string;
}

export interface ITopSpecialization {
  specalizationName: string;
  requestCount: number;
}

export interface ITopDoctor {
  fullName: string;
  specilization: string;
  image: string;
  requestCount: number;
}

export interface IRequestsDTO {
  numOfPendingRequest: number;
  numOfCompletedRequest: number;
  numOfCanceledRequest: number;
}

// ─── Doctor Registration (Admin) ─────────────────────────────────────────────
export interface IDoctorRegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  specialization: string;
  phoneNumber: string;
  dateOfBirth: string;
  imageUrl: File | null;
  gender: number; // 0=Male, 1=Female
}

// ─── Patient Registration ────────────────────────────────────────────────────
export interface IPatientRegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  imageUrl?: File | null;
  gender: number;
}

// ─── Doctor ──────────────────────────────────────────────────────────────────
export interface IDayScheduleDTO {
  day: string;
  timeSlots: string[];
}

export interface IAppointmentDTO {
  doctorName: string;
  price: number | null;
  specailization: string;
  availableDay: IDayScheduleDTO[];
}

export interface IDoctorBookingDTO {
  patientName: string;
  age: string;
  phoneNumber: string;
  day: string;
  image: string;
  startTime: string;
  endTime: string;
}

export interface ITimeDTO {
  startTime: string;
  endTime: string;
}

export interface IDayAppointmentDTO {
  day: number; // WeekDays enum
  timeDTOs: ITimeDTO[];
}

export interface IAddAppointmentDTO {
  doctorId: number;
  price: number;
  dayAppointments: IDayAppointmentDTO[];
}

export interface IUpdateAppointmentDTO {
  startTime: string;
  endTime: string;
}

// ─── Patient ─────────────────────────────────────────────────────────────────
export interface IPatientBookingDTO {
  doctorName: string;
  price: string;
  specailization: string;
  phoneNumber: string;
  day: string;
  finalPrice: string;
  startTime: string;
  endTime: string;
  image: string;
  bookingStatus: string;
}

export interface ICreateBookingDTO {
  appointmentId: number;
  couponName?: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface ICreateCouponDTO {
  couponName: string;
  couponCode: number; // DiscountCode enum
  isActive: boolean;
}

export interface ICouponUpdateDTO {
  couponId: number;
  couponName?: string;
  couponCode?: number;
  isActive?: boolean;
}
