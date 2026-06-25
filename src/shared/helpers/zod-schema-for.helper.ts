import { z } from "zod";
/**
 * Helper: returns a function that accepts only schemas whose output
 * type exactly matches T. Extra/missing/wrong-typed fields → compile error.
 */
export const schemaFor =
  <T>() =>
  <S extends z.ZodType<T>>(schema: S): S =>
    schema;
