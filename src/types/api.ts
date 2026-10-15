export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  // Present on validation failures (400)
  errors?: { path: string; message: string }[];
}