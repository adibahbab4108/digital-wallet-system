import { NextFunction, Request, Response } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const catchAsync = (fn: AsyncHandler) => {
  return (req: Request, res: Response, _next: NextFunction) => {
    Promise.resolve(fn(req, res, _next)).catch((err: any) => {
      _next(err);
    });
  };
};
