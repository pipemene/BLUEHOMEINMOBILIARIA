import { z } from 'zod';

export const Priority = z.enum(['LOW','MEDIUM','HIGH','URGENT']);
export const Status = z.enum(['OPEN','ASSIGNED','IN_PROGRESS','DONE','CANCELED']);

export const CreateOrder = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  propertyCode: z.string().min(1),
  clientName: z.string().min(2),
  clientPhone: z.string().min(6),
  priority: Priority.default('MEDIUM'),
  technicianId: z.string().optional().nullable(),
  photos: z.array(z.string().url()).optional().default([]),
  materials: z.array(z.object({
    name: z.string(),
    qty: z.number().positive(),
    unit: z.string().default('unit'),
    cost: z.number().nonnegative().default(0)
  })).optional().default([]),
  estStartAt: z.string().datetime().optional(),
  estEndAt: z.string().datetime().optional(),
  budget: z.number().nonnegative().optional().default(0)
});

export const UpdateOrder = CreateOrder.partial().extend({
  status: Status.optional()
});

const allowed = {
  OPEN: ['ASSIGNED','CANCELED'],
  ASSIGNED: ['IN_PROGRESS','CANCELED'],
  IN_PROGRESS: ['DONE','CANCELED'],
  DONE: [],
  CANCELED: []
};

export function canTransition(from, to) {
  if (from === to) return true;
  return (allowed[from] || []).includes(to);
}
