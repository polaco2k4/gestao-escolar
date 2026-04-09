import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  body: z.object({
    student_id: z.string().uuid('ID do estudante inválido'),
    academic_year_id: z.string().uuid('ID do ano académico inválido'),
    class_id: z.string().uuid('ID da turma inválido'),
    enrollment_number: z.string().optional().or(z.literal('')).transform(val => val || undefined),
    notes: z.string().optional().or(z.literal('')).transform(val => val || undefined),
  }),
});

export const transferSchema = z.object({
  body: z.object({
    enrollment_id: z.string().uuid(),
    from_school: z.string().optional(),
    to_school: z.string().optional(),
    transfer_date: z.string(),
    reason: z.string().optional(),
  }),
});
