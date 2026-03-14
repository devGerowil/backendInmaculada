import { supabaseAdmin } from './../config/supabase';
import { Request, Response } from 'express';
import { User, UserInput } from '../models/User';

export class UserController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userInput: UserInput = req.body;
      if (!userInput.email || !userInput.name) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email and name are required' 
        });
      }

      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([userInput])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const userInput: Partial <UserInput>= req.body;

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(userInput)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}
