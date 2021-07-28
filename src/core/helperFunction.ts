import { Response } from "express";
import { logger } from "./logger";

export const sendSuccess=(res: Response, data: object, message?: string,status:number=200): Response=> {
    return res.status(status).json({
        message: message || 'success',
        data: data
    });
};

export const sendError=(res: Response, message?: string,status:number=500): Response=> {
    return res.status(status).json({
        message: message || 'internal server error',
    });
};