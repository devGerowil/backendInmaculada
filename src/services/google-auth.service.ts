import { supabaseAdmin } from '../config/supabase';
import { generateAccessToken, generateRefreshToken, JwtPayload } from '../utils/jwt';

export interface GoogleUserData {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
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

export class GoogleAuthService {
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

  async findOrCreateUser(googleData: GoogleUserData): Promise<AuthResult> {
    const { googleId, email, name, picture } = googleData;

    let { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw new Error('Error al buscar usuario');
    }

    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          name,
          google_id: googleId,
          picture: picture || null
        }])
        .select()
        .single();

      if (createError || !newUser) {
        throw new Error(createError?.message || 'Error al crear usuario');
      }

      user = newUser;
    } else {
      if (!user.google_id) {
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({
            google_id: googleId,
            picture: picture || user.picture
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError || !updatedUser) {
          throw new Error(updateError?.message || 'Error al actualizar usuario');
        }

        user = updatedUser;
      }
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
