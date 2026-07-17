import { z } from "zod";

export const leadFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  company: z.string().trim().max(120).optional(),
  projectType: z.string().min(1),
  budget: z.string().min(1),
  message: z.string().trim().min(20).max(5000),
  consent: z.literal("yes"),
});

export type LeadForm = z.infer<typeof leadFormSchema>;
