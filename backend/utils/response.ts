import type { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  message: string;
  data?: T;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };

  return res.status(statusCode).json(response);
};