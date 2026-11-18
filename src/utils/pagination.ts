import type { Request } from 'express';
import type { PaginationQuery } from '#/types';

const DEFAULT_PAGE_LIMIT = 50;
const DEFAULT_PAGE_NUMBER = 1;

function getPaginationQuery(request: Request): PaginationQuery {
  const limit =
    request.query.limit === undefined ? DEFAULT_PAGE_LIMIT : Number(request.query.limit);
  const pageNumber =
    request.query.pageNumber === undefined ? DEFAULT_PAGE_NUMBER : Number(request.query.pageNumber);

  return { limit, pageNumber };
}

export { getPaginationQuery };
