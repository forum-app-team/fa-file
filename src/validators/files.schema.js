import { z } from 'zod';

export const PresignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  category: z.enum(['profile', 'postAttachment']),
});

export const UploadSchema = z.object({
  category: z.enum(['profile', 'postAttachment']),
});

