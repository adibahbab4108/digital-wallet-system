import { Response } from "express";

interface TMeta {
  page?: number;
  limit?: number;
  totalPage?: number;
  total?: number;
}

interface TDataResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(
  res: Response,
  dataResponse: TDataResponse<T>
) => {
  const { statusCode, success, message, data, meta } = dataResponse;

  return res.status(statusCode).json({
    statusCode,
    success,
    message,
    data,
    meta,
  });
};
