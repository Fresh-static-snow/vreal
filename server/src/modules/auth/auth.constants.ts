import { CookieOptions } from 'express';

export const refreshCookie = 'refreshToken';
export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth/refresh',
};
