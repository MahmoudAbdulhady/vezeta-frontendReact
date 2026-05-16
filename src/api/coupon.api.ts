import axiosClient from './axiosClient';
import type { ICreateCouponDTO, ICouponUpdateDTO, ICouponDTO } from '../models';

export const getAllCoupons = () =>
  axiosClient.get<ICouponDTO[]>('/api/Settings/GetAllCoupons');

export const createCoupon = (data: ICreateCouponDTO) => {
  const fd = new FormData();
  fd.append('CouponName', data.couponName);
  fd.append('CouponCode', String(data.couponCode));
  fd.append('IsActive', String(data.isActive));
  return axiosClient.post('/api/Settings/CreateCoupon', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deactivateCoupon = (id: number) =>
  axiosClient.post(`/api/Settings/DeactivateCoupon/${id}`);

export const deleteCoupon = (id: number) =>
  axiosClient.delete(`/api/Settings/DeleteCoupon/${id}`);

export const updateCoupon = (data: ICouponUpdateDTO) => {
  const fd = new FormData();
  fd.append('CouponId', String(data.couponId));
  if (data.couponName) fd.append('CouponName', data.couponName);
  if (data.couponCode !== undefined) fd.append('CouponCode', String(data.couponCode));
  if (data.isActive !== undefined) fd.append('IsActive', String(data.isActive));
  return axiosClient.put('/api/Settings/UpdateCoupon', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
