import { Errback, NextFunction, Request, Response } from "express";
import { envVars } from "../config/env.config";

export const GlobalErrorHAndler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  let message = err.message || "Internal Server Error";
  let statusCode = 500;
  let errorSources: any = [];

  res.status(err.status || statusCode).json({
    success: false,
    message,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
