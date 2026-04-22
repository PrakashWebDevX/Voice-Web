import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';

const router = Router();

// POST /api/auth/sync — Create or update user in MongoDB after Firebase auth
router.post('/sync', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid, email } = req.user!;
  const { displayName, photoURL } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      {
        $setOnInsert: {
          uid,
          email,
          plan: 'free',
          generationsUsed: 0,
          generationsLimit: 5,
        },
        $set: {
          ...(displayName && { displayName }),
          ...(photoURL && { photoURL }),
        },
      },
      { upsert: true, new: true }
    ).lean();

    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

// GET /api/auth/me — Get current user profile
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { uid } = req.user!;

  try {
    const user = await User.findOne({ uid }).select('-__v').lean();
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
