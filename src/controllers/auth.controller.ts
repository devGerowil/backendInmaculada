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

  async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token es requerido'
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

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

  async logout(req: Request, res: Response): Promise<Response> {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      return res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });
    } catch (error: any) {
      return res.status(500).json({
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
