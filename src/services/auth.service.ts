import { supabaseAdmin } from '../config/supabase';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class AuthService {
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

    const token = generateToken({
      id: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
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

    const token = generateToken({
      id: user.id,
      email: user.email
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };
  }
}
