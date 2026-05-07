import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { requireAuth } from './middleware/auth.js';
import profileRoutes from './routes/profile.js';
import foodRoutes from './routes/foods.js';
import intakeRoutes from './routes/intakes.js';
import exerciseRoutes from './routes/exercises.js';
import workoutRoutes from './routes/workouts.js';
import statusRoutes from './routes/status.js';
import photoRoutes from './routes/photos.js';
import notesRoutes from './routes/notes.js';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true, name: 'musclesbuzz-api' }));

app.use('/api/profile', requireAuth, profileRoutes);
app.use('/api/foods', requireAuth, foodRoutes);
app.use('/api/intakes', requireAuth, intakeRoutes);
app.use('/api/exercises', requireAuth, exerciseRoutes);
app.use('/api/workouts', requireAuth, workoutRoutes);
app.use('/api/status', requireAuth, statusRoutes);
app.use('/api/photos', requireAuth, photoRoutes);
app.use('/api/notes', requireAuth, notesRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({ error: error.message || 'Internal server error' });
});

app.listen(port, () => {
  console.log(`MusclesBuzz API running on http://localhost:${port}`);
});
