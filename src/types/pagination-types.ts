interface PaginationQuery {
  limit: number;
  pageNumber: number;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  pageNumber: number;
}

export type { PaginationQuery, PaginatedResponse };
