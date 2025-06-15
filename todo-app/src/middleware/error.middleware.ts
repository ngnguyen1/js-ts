import { Request, Response, NextFunction } from 'express';

export class ApiError extends Error {
  statusCode: number;
  constructor(code: number, message: string) {
    super(message);
    this.statusCode = code;
  }
}

export function errorHandler(
  err: any, _req: Request, res: Response, _next: NextFunction
) {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message });
}

