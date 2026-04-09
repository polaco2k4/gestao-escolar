import { z } from 'zod';

export const createStudentSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    last_name: z.string().min(2, 'Apelido deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    student_number: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    birth_date: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    gender: z.union([z.enum(['M', 'F']), z.literal('')]).optional().transform(val => val || undefined),
    nationality: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    address: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    blood_type: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    medical_notes: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    guardian_id: z.string().uuid().optional().or(z.literal('')).transform(val => val || undefined),
    password: z.string().optional().or(z.literal('')).transform(val => val && val.length >= 6 ? val : undefined),
  }),
});

export const updateStudentSchema = z.object({
  body: z.object({
    first_name: z.string().min(2).optional(),
    last_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    birth_date: z.string().optional(),
    gender: z.enum(['M', 'F']).optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    blood_type: z.string().optional(),
    medical_notes: z.string().optional(),
    guardian_id: z.string().uuid().optional().nullable(),
    active: z.boolean().optional(),
  }),
});
