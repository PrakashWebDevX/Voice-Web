import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { Generation } from '../models/Generation';

const router = Router();

// GET /api/history — Get user's generation history
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const uid = req.user!.uid;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
  const skip = (page - 1) * limit;

  try {
    const [generations, total] = await Promise.all([
      Generation.find({ userId: uid })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-generatedCode') // Don't return full code in list
        .lean(),
      Generation.countDocuments({ userId: uid }),
    ]);

    res.json({
      generations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// GET /api/history/:id — Get single generation with full code
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.user!.uid;

  try {
    const generation = await Generation.findOne({ _id: id, userId: uid }).lean();
    if (!generation) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }
    res.json({ generation });
  } catch {
    res.status(500).json({ error: 'Failed to fetch generation' });
  }
});

// DELETE /api/history/:id — Delete a generation
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.user!.uid;

  try {
    const result = await Generation.deleteOne({ _id: id, userId: uid });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }
    res.json({ message: 'Deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Failed to delete generation' });
  }
});

// PATCH /api/history/:id/favorite — Toggle favorite
router.patch('/:id/favorite', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.user!.uid;

  try {
    const generation = await Generation.findOne({ _id: id, userId: uid });
    if (!generation) {
      res.status(404).json({ error: 'Generation not found' });
      return;
    }
    generation.isFavorited = !generation.isFavorited;
    await generation.save();
    res.json({ isFavorited: generation.isFavorited });
  } catch {
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

export default router;
