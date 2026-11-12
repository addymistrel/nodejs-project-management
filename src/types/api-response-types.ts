interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

export type { ApiErrorResponse, ApiSuccessResponse };
