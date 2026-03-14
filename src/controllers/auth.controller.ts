import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;

      const result = await this.authService.login({ email, password });

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password, name } = req.body;

      const result = await this.authService.register({ email, password, name });

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      const statusCode = error.message.includes('ya está registrado') ? 409 : 500;
      return res.status(statusCode).json({
        success: false,
        error: error.message
      });
    }
  }
}
