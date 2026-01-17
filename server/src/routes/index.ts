import { Router } from 'express';
import { sessionManager } from '../session';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/session', (req, res) => {
  res.json(sessionManager.getSession());
});

export { router };

