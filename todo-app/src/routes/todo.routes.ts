import { Router } from 'express';
import {
  createTodo, getTodos, updateTodo, deleteTodo
} from '../controllers/todo.controller';
import { protect } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { todoCreateSchema, todoUpdateSchema } from '../schemas/todo.schema';

const router = Router();
router.use(protect);
router.post(   '/', validateBody(todoCreateSchema), createTodo);
router.get(    '/',               getTodos);
router.put('/:id', validateBody(todoUpdateSchema), updateTodo);
router.delete('/:id',             deleteTodo);
export default router;

