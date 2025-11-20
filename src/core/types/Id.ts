// Brand utility type: creates a unique type by combining a primitive type (Prim) with a string tag (Tag).
// This helps TypeScript distinguish between different ID types, even if they have the same underlying type.
export type Brand<Prim, Tag extends string> = Prim & { readonly __brand: Tag };

// Id type alias: represents a strongly-typed ID by branding a primitive type with a specific tag.
// Example: Id<number, "UserId"> is a unique type for user IDs.
export type Id<Prim extends string | number | bigint, Tag extends string> = Brand<Prim, Tag>;

// Creates a branded numeric ID of a specific tag.
// Ensures the number is a positive integer before branding.
// Usage: const userId = numericId<"UserId">(123);
export const numericId = <Tag extends string>(n: number): Id<number, Tag> => {
  if (!Number.isInteger(n) || n <= 0) throw new Error("Invalid id");
  return n as Id<number, Tag>;
};

// Creates a branded string ID of a specific tag.
// Ensures the string is not empty (after trimming) before branding.
// Usage: const orderId = stringId<"OrderId">("abc-123");
export const stringId = <Tag extends string>(s: string): Id<string, Tag> => {
  const trimmed = s.trim();
  if (!trimmed) {
    throw new Error("Empty id");
  }
  return trimmed as Id<string, Tag>;
};
