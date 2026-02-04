/**
 * Laravel devuelve listas paginadas como { data: T[], meta: { total, current_page, last_page }, links }.
 * Este helper unifica el unwrap (DRY) para APIs que pueden devolver array directo o ese objeto.
 */
export interface LaravelPaginatedMeta {
  total: number;
  current_page: number;
  last_page: number;
}

export interface LaravelPaginatedResult<T> {
  items: T[];
  total: number;
  currentPage: number;
  lastPage: number;
}

export function unwrapLaravelPaginated<T>(
  payload: T[] | { data: T[]; meta?: LaravelPaginatedMeta }
): LaravelPaginatedResult<T> {
  const items = Array.isArray(payload) ? payload : payload?.data && Array.isArray(payload.data) ? payload.data : [];
  const meta = !Array.isArray(payload) && payload && "meta" in payload ? payload.meta : undefined;
  return {
    items,
    total: meta?.total ?? items.length,
    currentPage: meta?.current_page ?? 1,
    lastPage: meta?.last_page ?? 1,
  };
}
