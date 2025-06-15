import { Schema, model, Document, Types } from 'mongoose';

export interface ITodo extends Document {
  user: Types.ObjectId;
  content: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const todoSchema = new Schema<ITodo>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

export const Todo = model<ITodo>('Todo', todoSchema);

