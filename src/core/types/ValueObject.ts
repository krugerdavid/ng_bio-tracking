/**
 * BaseValueObject is a generic interface that defines the basic properties of a value object.
 *
 * @param T - The type of the value object's value
 */
export interface BaseValueObject<T> {
  value: T;
  equals(valueObject: BaseValueObject<T>): boolean;
}
