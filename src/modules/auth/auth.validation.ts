import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
    first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    last_name: z.string().min(2, 'Apelido deve ter pelo menos 2 caracteres'),
    role: z.enum(['admin', 'gestor', 'professor', 'estudante', 'encarregado']),
    phone: z.string().optional(),
    school_id: z.string().uuid().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Password é obrigatória'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1, 'Refresh token é obrigatório'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    current_password: z.string().min(1, 'Password actual é obrigatória'),
    new_password: z.string().min(6, 'Nova password deve ter pelo menos 6 caracteres'),
  }),
});
