import { supabaseAdmin } from '../config/supabase';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, JwtPayload } from '../utils/jwt';
import bcrypt from 'bcrypt';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthService {
  private async saveRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await supabaseAdmin
      .from('refresh_tokens')
      .insert([{
        user_id: userId,
        token,
        expires_at: expiresAt.toISOString()
      }]);
  }

  private async deleteRefreshToken(token: string): Promise<void> {
    await supabaseAdmin
      .from('refresh_tokens')
      .delete()
      .eq('token', token);
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password } = credentials;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Credenciales inválidas');
    }

    if (!user.password) {
      throw new Error('El usuario no tiene una contraseña configurada');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .single();

    if (tokenError || !tokenData) {
      throw new Error('Refresh token inválido');
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      await this.deleteRefreshToken(refreshToken);
      throw new Error('Refresh token expirado');
    }

    const decoded = verifyRefreshToken(refreshToken);

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    if (userError || !user) {
      throw new Error('Usuario no encontrado');
    }

    await this.deleteRefreshToken(refreshToken);

    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email
    });
    const newRefreshToken = generateRefreshToken({
      id: user.id,
      email: user.email
    });

    await this.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.deleteRefreshToken(refreshToken);
  }

  async register(userData: { email: string; password: string; name: string }): Promise<AuthResult> {
    const { email, password, name } = userData;

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([{
        email,
        name,
        password: hashedPassword
      }])
      .select()
      .single();

    if (error || !user) {
      throw new Error(error?.message || 'Error al crear el usuario');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }
}
