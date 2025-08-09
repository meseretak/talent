/**
 * Utility for standardized API responses
 */

/**
 * Standard API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: Record<string, any>;
}

/**
 * Creates a success response
 * @param data The data to include in the response
 * @param message Optional success message
 * @param meta Optional metadata (pagination, etc.)
 * @returns Standardized success response object
 */
export const successResponse = <T = any>(
  data?: T,
  message?: string,
  meta?: Record<string, any>,
): ApiResponse<T> => {
  return {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(meta && { meta }),
  };
};

/**
 * Creates an error response
 * @param message Error message
 * @param data Optional error data
 * @param meta Optional metadata
 * @returns Standardized error response object
 */
export const errorResponse = (
  message: string,
  data?: any,
  meta?: Record<string, any>,
): ApiResponse => {
  return {
    success: false,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };
};

/**
 * Creates a paginated response
 * @param data The data array to include in the response
 * @param page Current page number
 * @param limit Items per page
 * @param totalCount Total number of items
 * @param message Optional success message
 * @returns Standardized paginated response
 */
export const paginatedResponse = <T = any[]>(
  data: T,
  page: number,
  limit: number,
  totalCount: number,
  message?: string,
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    meta: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasMore: page * limit < totalCount,
    },
  };
};
