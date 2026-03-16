import { Request, Response } from 'express';
import passport from 'passport';
import { GoogleAuthService } from '../services/google-auth.service';
import { GoogleUser } from '../config/passport';
import dotenv from 'dotenv';

dotenv.config();

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export class GoogleAuthController {
  private googleAuthService: GoogleAuthService;

  constructor() {
    this.googleAuthService = new GoogleAuthService();
  }

  redirectToGoogle() {
    return passport.authenticate('google', {
      scope: ['profile', 'email']
    });
  }

  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as GoogleUser;

      if (!user || !user.email) {
        res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
        return;
      }

      const result = await this.googleAuthService.findOrCreateUser({
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
      });

      const encodedTokens = Buffer.from(
        JSON.stringify({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken
        })
      ).toString('base64');

      res.redirect(
        `${frontendUrl}/auth/callback?tokens=${encodedTokens}&user=${encodeURIComponent(
          JSON.stringify(result.user)
        )}`
      );
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
  }
}
