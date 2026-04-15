import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function dbGuard(req: Request, res: Response, next: NextFunction) {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Service temporarily unavailable' })
    }

    next()
}