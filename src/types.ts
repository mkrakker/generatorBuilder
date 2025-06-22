/**
 * Represents an independent parameter that can be an array or a generator.
 */
export type IndependentParam = readonly unknown[] | Generator;

/**
 * Represents a dependent parameter that is a function taking dependencies and returning a generator.
 * @template D - The type of dependencies
 */
export type DependentParam<D> = (dependencies: D) => Generator;

/**
 * Utility type that extracts the yielded type from arrays, generators, or functions returning generators.
 * @template T - The type to extract yields from
 */
export type Yields<T> = T extends readonly (infer U)[]
  ? U
  : T extends Generator<infer U>
    ? U
    : // biome-ignore lint/suspicious/noExplicitAny: Parameter only used for structural pattern matching, not type safety
      T extends (deps: any) => Generator<infer U>
      ? U
      : never;

/**
 * Interface for a generator builder that allows adding parameters and building generators.
 * @template T - The type of objects that will be yielded by the generator
 */
export interface GeneratorBuilder<T> {
  /**
   * Adds new parameters to the generator builder.
   * @template P - The type of parameters being added
   * @param param - An object where keys are parameter names and values are either arrays, generators, or functions returning generators
   * @returns A new generator builder with the added parameters
   */
  add<P extends Record<string, IndependentParam | DependentParam<T>>>(
    param: P,
  ): GeneratorBuilder<T & { [K in keyof P]: Yields<P[K]> }>;

  /**
   * Builds and returns a generator that yields all possible combinations of the defined parameters.
   * @returns A generator that yields objects containing all parameter combinations
   */
  build(): Generator<T, void, unknown>;
}
