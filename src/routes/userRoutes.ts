import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/users',authMiddleware, userController.getAll.bind(userController));
router.get('/users/:id',authMiddleware, userController.getById.bind(userController));
router.post('/users',authMiddleware, userController.create.bind(userController));
router.put('/users/:id',authMiddleware, userController.update.bind(userController));
router.delete('/users/:id',authMiddleware, userController.delete.bind(userController));

export default router;