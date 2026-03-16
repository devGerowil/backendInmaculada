import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

router.get('/users', (req: Request, res: Response, next: NextFunction) => {
  (authMiddleware as any)(req, res, next);
}, async (req: Request, res: Response) => {
  return userController.getAll(req, res);
});
router.get('/users/:id', (req: Request, res: Response, next: NextFunction) => {
  (authMiddleware as any)(req, res, next);
}, async (req: Request, res: Response) => {
  return userController.getById(req, res);
});
router.post('/users', (req: Request, res: Response, next: NextFunction) => {
  (authMiddleware as any)(req, res, next);
}, async (req: Request, res: Response) => {
  return userController.create(req, res);
});
router.put('/users/:id', (req: Request, res: Response, next: NextFunction) => {
  (authMiddleware as any)(req, res, next);
}, async (req: Request, res: Response) => {
  return userController.update(req, res);
});
router.delete('/users/:id', (req: Request, res: Response, next: NextFunction) => {
  (authMiddleware as any)(req, res, next);
}, async (req: Request, res: Response) => {
  return userController.delete(req, res);
});

export default router;
