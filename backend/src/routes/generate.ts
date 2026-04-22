import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { generateLimiter } from '../middleware/rateLimiter';
import { validateBody, GenerateSchema, ExplainSchema } from '../middleware/validateInput';
import { streamGeneration, generateTitle, explainCode } from '../services/claudeService';
import { buildZip } from '../utils/zipBuilder';
import { User } from '../models/User';
import { Generation } from '../models/Generation';
import { CodeType } from '../models/Generation';

const router = Router();

const LANGUAGE_MAP: Record<CodeType, string> = {
  'html-website': 'html',
  'react-component': 'tsx',
  'nextjs-page': 'tsx',
  'node-express-api': 'typescript',
  'python-script': 'python',
  'arduino-code': 'cpp',
  'full-stack': 'markdown',
};

// POST /api/generate/stream — SSE streaming endpoint
router.post(
  '/stream',
  authMiddleware,
  generateLimiter,
  validateBody(GenerateSchema),
  async (req: AuthRequest, res: Response) => {
    const { prompt, codeType } = req.body as { prompt: string; codeType: CodeType };
    const uid = req.user!.uid;

    // Check usage limits
    let user = await User.findOne({ uid });
    if (!user) {
      // Auto-create user on first generation
      user = await User.create({
        uid,
        email: req.user!.email,
        plan: 'free',
        generationsUsed: 0,
        generationsLimit: 5,
      });
    }

    if (user.plan === 'free' && user.generationsUsed >= user.generationsLimit) {
      res.status(403).json({
        error: 'Generation limit reached',
        code: 'LIMIT_REACHED',
        used: user.generationsUsed,
        limit: user.generationsLimit,
        plan: user.plan,
      });
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    const sendEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    const startTime = Date.now();
    let savedGenerationId: string | null = null;

    sendEvent('start', { message: 'Generating...', codeType });

    await streamGeneration(prompt, codeType, {
      onToken: (token) => {
        sendEvent('token', { token });
      },
      onComplete: async (fullText, inputTokens, outputTokens) => {
        const durationMs = Date.now() - startTime;

        try {
          // Generate title in parallel with saving
          const [title] = await Promise.all([generateTitle(prompt)]);

          const generation = await Generation.create({
            userId: uid,
            prompt,
            codeType,
            generatedCode: fullText,
            language: LANGUAGE_MAP[codeType],
            tokensUsed: inputTokens + outputTokens,
            durationMs,
            title,
          });

          savedGenerationId = (generation._id as string).toString();

          // Increment usage for free users
          if (user!.plan === 'free') {
            await User.updateOne({ uid }, { $inc: { generationsUsed: 1 } });
          }

          sendEvent('complete', {
            generationId: savedGenerationId,
            title,
            tokensUsed: inputTokens + outputTokens,
            durationMs,
            remainingGenerations:
              user!.plan === 'free'
                ? Math.max(0, user!.generationsLimit - user!.generationsUsed - 1)
                : null,
          });
        } catch (err) {
          sendEvent('error', { message: 'Failed to save generation' });
        }

        res.end();
      },
      onError: (error) => {
        sendEvent('error', { message: error.message || 'Generation failed' });
        res.end();
      },
    });
  }
);

// POST /api/generate/explain — Explain generated code
router.post(
  '/explain',
  authMiddleware,
  validateBody(ExplainSchema),
  async (req: AuthRequest, res: Response) => {
    const { code, generationId } = req.body as { code: string; generationId?: string };

    try {
      const explanation = await explainCode(code);

      if (generationId) {
        await Generation.updateOne(
          { _id: generationId, userId: req.user!.uid },
          { $set: { explanation } }
        );
      }

      res.json({ explanation });
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate explanation' });
    }
  }
);

// POST /api/generate/download — Download code as ZIP
router.post(
  '/download',
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { code, codeType, title } = req.body as {
      code: string;
      codeType: CodeType;
      title: string;
    };

    if (!code || !codeType || !title) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const zipBuffer = await buildZip(code, codeType, title);
      const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', zipBuffer.length);
      res.send(zipBuffer);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create ZIP' });
    }
  }
);

export default router;
