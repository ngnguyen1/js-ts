import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Todo } from '../models/todo.model';
import { ApiError } from '../middleware/error.middleware';

export async function createTodo(req: AuthRequest, res: Response) {
  const todo = await Todo.create({ ...req.body, user: req.userId });
  res.status(201).json({ success: true, data: todo });
}

export async function getTodos(req: AuthRequest, res: Response) {
  const todos = await Todo.find({ user: req.userId });
  res.json({ success: true, data: todos });
}

export async function updateTodo(req: AuthRequest, res: Response) {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    req.body, { new: true }
  );
  if (!todo) throw new ApiError(404, 'Todo not found');
  res.json({ success: true, data: todo });
}

export async function deleteTodo(req: AuthRequest, res: Response) {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id, user: req.userId
  });
  if (!todo) throw new ApiError(404, 'Todo not found');
  res.json({ success: true, message: 'Deleted' });
}

