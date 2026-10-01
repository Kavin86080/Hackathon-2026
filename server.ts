import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authRouter } from './server/src/routes/auth.routes.ts';
import { questionRouter } from './server/src/routes/question.routes.ts';
import { rubricRouter } from './server/src/routes/rubric.routes.ts';
import { knowledgeRouter } from './server/src/routes/knowledge.routes.ts';
import { answerRouter } from './server/src/routes/answer.routes.ts';
import { evaluationRouter } from './server/src/routes/evaluation.routes.ts';
import { feedbackRouter } from './server/src/routes/feedback.routes.ts';
import { analyticsRouter } from './server/src/routes/analytics.routes.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ExplainGrade AI',
    engine: 'v2.4-deterministic',
    timestamp: new Date().toISOString(),
  });
});

// Mount modular REST APIs
app.use('/api/auth', authRouter);
app.use('/api/questions', questionRouter);
app.use('/api/rubrics', rubricRouter);
app.use('/api/knowledge', knowledgeRouter);
app.use('/api/answers', answerRouter);
app.use('/api/evaluations', evaluationRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/analytics', analyticsRouter);

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ExplainGrade AI Server running on port ${port} (mode: ${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
