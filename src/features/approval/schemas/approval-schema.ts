import { z } from 'zod';

export const approvalNoteSchema = z.object({
  note: z
    .string()
    .max(500, 'approval.note.maxLength')
    .nullable()
    .optional(),
});

export type ApprovalNoteSchema = z.infer<typeof approvalNoteSchema>;
