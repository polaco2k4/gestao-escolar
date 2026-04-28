import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    phone?: string;
    school_id?: string;
  }) {
    const existing = await db('users').where({ email: data.email }).first();
    if (existing) {
      throw new AppError('Email já registado', 409);
    }

    // Garantir que o usuário tenha uma escola
    let finalSchoolId = data.school_id;
    if (!finalSchoolId) {
      const firstSchool = await db('schools').select('id').first();
      if (firstSchool) {
        finalSchoolId = firstSchool.id;
      }
    }

    const password_hash = await bcrypt.hash(data.password, 12);

    const [user] = await db('users')
      .insert({
        email: data.email,
        password_hash,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        phone: data.phone,
        school_id: finalSchoolId,
      })
      .returning(['id', 'email', 'first_name', 'last_name', 'role', 'school_id']);

    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await db('users as u')
      .leftJoin('schools as s', 's.id', 'u.school_id')
      .where({ 'u.email': email, 'u.active': true })
      .select(
        'u.*',
        's.name as school_name',
        's.logo_url as school_logo_url'
      )
      .first();
      
    if (!user) {
      throw new AppError('Credenciais inválidas', 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    await db('users').where({ id: user.id }).update({ last_login: new Date() });

    const tokens = await this.generateTokens(user);

    const { password_hash, ...userData } = user;
    return { user: userData, ...tokens };
  }

  async refreshToken(refreshToken: string) {
    const stored = await db('refresh_tokens')
      .where({ token: refreshToken })
      .where('expires_at', '>', new Date())
      .first();

    if (!stored) {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }

    const user = await db('users').where({ id: stored.user_id, active: true }).first();
    if (!user) {
      throw new AppError('Utilizador não encontrado', 404);
    }

    await db('refresh_tokens').where({ id: stored.id }).delete();

    const tokens = await this.generateTokens(user);
    return tokens;
  }

  async logout(userId: string) {
    await db('refresh_tokens').where({ user_id: userId }).delete();
  }

  async getProfile(userId: string) {
    const user = await db('users as u')
      .leftJoin('schools as s', 's.id', 'u.school_id')
      .where({ 'u.id': userId })
      .select(
        'u.id',
        'u.email',
        'u.first_name',
        'u.last_name',
        'u.role',
        'u.phone',
        'u.avatar_url',
        'u.school_id',
        's.name as school_name',
        's.logo_url as school_logo_url',
        'u.created_at'
      )
      .first();

    if (!user) {
      throw new AppError('Utilizador não encontrado', 404);
    }
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await db('users').where({ id: userId }).first();
    if (!user) {
      throw new AppError('Utilizador não encontrado', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new AppError('Password actual incorrecta', 400);
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await db('users').where({ id: userId }).update({ password_hash, updated_at: new Date() });
  }

  private async generateTokens(user: any) {
    const payload = { id: user.id, email: user.email, role: user.role, school_id: user.school_id };

    // @ts-ignore - JWT types issue
    const access_token = jwt.sign(
      payload, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refresh_token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db('refresh_tokens').insert({
      user_id: user.id,
      token: refresh_token,
      expires_at: expiresAt,
    });

    return { access_token, refresh_token };
  }
}
