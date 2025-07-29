import { NextFunction, Request, Response } from "express";

interface AsyncHandler {
  (req: Request, res: Response, next: NextFunction): Promise<any>;
}

export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err: any) => {
      next(err);
    });
  };
};
