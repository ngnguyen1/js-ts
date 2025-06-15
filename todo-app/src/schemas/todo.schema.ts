import Joi from 'joi';

export const todoCreateSchema = Joi.object({
  content: Joi.string().min(1).required()
});

export const todoUpdateSchema = Joi.object({
  content: Joi.string().min(1).optional(),
  completed: Joi.boolean().optional()
});

