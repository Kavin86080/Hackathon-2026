import { Router } from 'express';
import { db } from '../database/db.ts';

export const authRouter = Router();

authRouter.get('/users', (req, res) => {
  const users = db.getUsers();
  res.json({ success: true, users });
});

authRouter.post('/login', (req, res) => {
  const { role, email } = req.body;
  const users = db.getUsers();

  let user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user && role) {
    user = users.find((u) => u.role === role);
  }
  if (!user) {
    user = users[0];
  }

  res.json({
    success: true,
    user,
    token: `demo-token-${user.id}-${Date.now()}`,
  });
});

authRouter.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  const users = db.getUsers();
  // Default to faculty or student based on query/header
  const role = req.query.role as string;
  const user = users.find((u) => (role ? u.role === role : true)) || users[0];
  res.json({ success: true, user });
});
