import type { Result } from "./Result";

/**
 * A Repository is a generic interface that defines the basic CRUD operations for a given entity.
 *
 * @param T - The type of the entity
 * @param TId - The type of the entity's id
 */
export interface Repository<T, TId> {
  findById(id: TId): Promise<Result<T | null>>;
  save(entity: T): Promise<Result<T>>;
  delete(id: TId): Promise<Result<void>>;
}
