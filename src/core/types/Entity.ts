import type { Id } from "./Id";

/**
 * BaseEntity is a generic interface that defines the basic properties of an entity.
 *
 * @param T - The type of the entity's id (must be a branded Id type)
 */
export interface BaseEntity<T extends Id<string | number, string>> {
  id: T;
  equals(entity: BaseEntity<T>): boolean;
}
