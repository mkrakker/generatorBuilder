import type { GeneratorBuilder } from './types.ts';

/**
 * Creates a new generator builder with initial parameters.
 * @template TInitial - The type of initial parameters
 * @param initialParameters - An object where keys are parameter names and values are arrays of possible values
 * @returns A generator builder instance
 */
export function generatorBuilder<
  TInitial extends Record<string, readonly unknown[]>,
>(
  initialParameters: TInitial,
): GeneratorBuilder<{ [K in keyof TInitial]: TInitial[K][number] }>;

/**
 * Creates a new generator builder with no initial parameters.
 * @returns An empty generator builder instance
 */
export function generatorBuilder(): GeneratorBuilder<NonNullable<unknown>>;

/**
 * Implementation of the generator builder function.
 * @template T - The type of objects that will be yielded by the generator
 * @param initialParameters - An object where keys are parameter names and values are arrays, generators, or functions returning generators
 * @returns A generator builder instance
 */
export function generatorBuilder<T = NonNullable<unknown>>(
  // biome-ignore lint/suspicious/noExplicitAny: fallback overload needs any type
  initialParameters: Record<string, any> = {},
): GeneratorBuilder<T> {
  return {
    add(param) {
      const newParameters = {
        ...initialParameters,
        ...param,
      };
      // biome-ignore lint/suspicious/noExplicitAny: fallback overload needs any type
      return generatorBuilder(newParameters) as any;
    },

    build(): Generator<T, void, unknown> {
      const parameters = initialParameters;
      const keys = Object.keys(parameters);

      if (keys.length === 0) {
        function* emptyGenerator(): Generator<T, void, unknown> {}
        return emptyGenerator();
      }

      function* generateCombinations(
        keyIndex: number,
        currentResult: Record<string, unknown>,
      ): Generator<NonNullable<unknown>, void, unknown> {
        if (keyIndex >= keys.length) {
          yield currentResult;
          return;
        }

        // biome-ignore lint/style/noNonNullAssertion: the index is guaranteed to be valid, therefore, this can't be undefined
        const currentKey = keys[keyIndex]!;
        const parameterValue = parameters[currentKey];
        let iterable: Iterable<unknown>;

        if (typeof parameterValue === 'function') {
          iterable = parameterValue(currentResult);
        } else {
          iterable = parameterValue as Iterable<unknown>;
        }

        let yieldedSomething = false;
        for (const value of iterable) {
          yieldedSomething = true;
          const nextResult = { ...currentResult, [currentKey]: value };
          yield* generateCombinations(keyIndex + 1, nextResult);
        }

        if (!yieldedSomething) {
          yield* generateCombinations(keyIndex + 1, currentResult);
        }
      }

      return generateCombinations(0, {}) as Generator<T, void, unknown>;
    },
  };
}
