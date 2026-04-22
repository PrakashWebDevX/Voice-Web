import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const codeTypes = [
  'html-website',
  'react-component',
  'nextjs-page',
  'node-express-api',
  'python-script',
  'arduino-code',
  'full-stack',
] as const;

export const GenerateSchema = z.object({
  prompt: z
    .string()
    .min(5, 'Prompt must be at least 5 characters')
    .max(2000, 'Prompt must be under 2000 characters')
    .trim(),
  codeType: z.enum(codeTypes),
});

export const ExplainSchema = z.object({
  code: z.string().min(10).max(50000),
  generationId: z.string().optional(),
});

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation error',
        details: result.error.flatten().fieldErrors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
