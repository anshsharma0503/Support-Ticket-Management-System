import jwt from 'jsonwebtoken';

export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'fallback_development_secret_key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side JS from reading the cookie (mitigating XSS)
    secure: isProduction, // Transmitted only over HTTPS in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  });
};

export const clearAuthCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    expires: new Date(0)
  });
};
