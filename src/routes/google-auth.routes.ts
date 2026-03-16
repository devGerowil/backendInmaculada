import { Router } from 'express';
import passport from 'passport';
import { GoogleAuthController } from '../controllers/google-auth.controller';

const router = Router();
const googleAuthController = new GoogleAuthController();

router.get(
  '/google',
  googleAuthController.redirectToGoogle()
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  googleAuthController.handleGoogleCallback.bind(googleAuthController)
);

router.get('/google/failure', (_req, res) => {
  res.status(400).json({
    success: false,
    error: 'Autenticación con Google fallida'
  });
});

export default router;
