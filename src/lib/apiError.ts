import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

// Turns any thrown error into a message that is safe to show the user
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return 'Network error. Check your connection and try again.';
    }

    const data = error.response.data;

    // Validation errors list the exact field problems
    if (data?.errors?.length) return data.errors[0].message;
    if (data?.message) return data.message;
  }

  return fallback;
};