import { body } from 'express-validator';

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
];

export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es requerido')
];

export const logoutValidation = [
  body('refreshToken')
    .optional()
    .notEmpty()
    .withMessage('El refresh token no puede estar vacío')
];
