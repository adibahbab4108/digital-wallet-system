import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

export const validateWithZodSchema =
  (zodSchema: ZodTypeAny) =>
  async (req: Request, res: Response, _next: NextFunction) => {
    try {
      req.body = await zodSchema.parseAsync(req.body);
      _next();
    } catch (error) {
      _next(error);
    }
  };
