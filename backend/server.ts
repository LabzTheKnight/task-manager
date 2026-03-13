import cors from 'cors';
import express from 'express';

import tasksRouter from './APIs/tasks';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());
app.use(tasksRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});