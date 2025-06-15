import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import todoRoutes from './routes/todo.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();
const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/todos', todoRoutes);

// Global error handler
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));

