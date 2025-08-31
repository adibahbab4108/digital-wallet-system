import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env.config";

export const GlobalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (envVars.NODE_ENV === "development") {
    console.log(err);
  }

  const message = err.message || "Internal Server Error";
  const statusCode = 500;
  // const errorSources: any = [];

  res.status(err.status || statusCode).json({
    success: false,
    message,
    err: envVars.NODE_ENV === "development" ? err : null,
    stack: envVars.NODE_ENV === "development" ? err.stack : null,
  });
};
