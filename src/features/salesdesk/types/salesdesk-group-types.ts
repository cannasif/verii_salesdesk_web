import { z } from 'zod';

export interface SalesDeskGroupDto {
  id: number;
  name: string;
  description: string;
  memberUserIds: number[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export const salesDeskGroupFormSchema = z.object({
  name: z.string().trim().min(1, 'Grup adi zorunludur.').max(120, 'Grup adi en fazla 120 karakter olabilir.'),
  description: z.string().max(500, 'Aciklama en fazla 500 karakter olabilir'),
  memberUserIds: z.array(z.number().int().positive()),
});

export type SalesDeskGroupFormSchema = z.infer<typeof salesDeskGroupFormSchema>;
