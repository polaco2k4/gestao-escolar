import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  body: z.object({
    student_id: z.string().uuid(),
    academic_year_id: z.string().uuid(),
    class_id: z.string().uuid(),
    enrollment_number: z.string().min(1).optional(),
    notes: z.string().optional(),
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
