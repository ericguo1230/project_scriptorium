export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;

export interface PaginationParams {
  page: number;
  limit: number;
}

export function paginate({ page, limit }: PaginationParams) {
  const currentPage = page || DEFAULT_PAGE;
  const currentLimit = limit || DEFAULT_LIMIT;
  const skip = (currentPage - 1) * currentLimit;

  return { skip, take: currentLimit, page: currentPage, limit: currentLimit };
}
