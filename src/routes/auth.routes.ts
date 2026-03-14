import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { loginValidation, registerValidation, refreshTokenValidation, logoutValidation } from '../validators/auth.validator';
import { validate } from '../middlewares/validate.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', loginValidation, validate, authController.login.bind(authController));
router.post('/register', registerValidation, validate, authController.register.bind(authController));
router.post('/refresh-token', refreshTokenValidation, validate, authController.refreshToken.bind(authController));
router.post('/logout', logoutValidation, validate, authController.logout.bind(authController));

export default router;
