import { Request, Response, NextFunction } from 'express';

// Simple session-based auth middleware (for now, just check if userId is in cookie)
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.cookies?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Attach userId to request for use in routes
  (req as any).userId = parseInt(userId);
  next();
};
