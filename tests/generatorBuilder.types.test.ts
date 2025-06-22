import { assertType, type Equal } from 'asserttt';
import { generatorBuilder } from '../src';
import type { GeneratorBuilder, Yields } from '../src/types.ts';

type GeneratorYield<TGenerator> = TGenerator extends Generator<infer T>
  ? T
  : never;

// Test the basic type inference for independent parameters
{
  const builder = generatorBuilder({
    color: ['red', 'blue'] as const,
    size: ['small', 'large'] as const,
  });

  // Test that the builder has the correct type
  assertType<
    Equal<
      typeof builder,
      {
        add: <
          P extends Record<
            string,
            | readonly unknown[]
            | Generator
            | ((dependencies: {
                color: 'red' | 'blue';
                size: 'small' | 'large';
              }) => Generator)
          >,
        >(
          param: P,
        ) => GeneratorBuilder<
          { color: 'red' | 'blue'; size: 'small' | 'large' } & {
            [K in keyof P]: Yields<P[K]>;
          }
        >;
        build: () => Generator<
          {
            color: 'red' | 'blue';
            size: 'small' | 'large';
          },
          void,
          unknown
        >;
      }
    >
  >(true);

  // Test the generator's yielded type
  const generator = builder.build();

  // Get the type of the yielded value
  type YieldedType = GeneratorYield<typeof generator>;

  // Verify the yielded type has the correct structure
  assertType<
    Equal<
      YieldedType,
      {
        color: 'red' | 'blue';
        size: 'small' | 'large';
      }
    >
  >(true);
}

// Test type inference with dependent parameters
{
  const builder = generatorBuilder({
    category: ['electronics', 'clothing'] as const,
  }).add({
    subcategory: function* ({
      category,
    }: {
      category: 'electronics' | 'clothing';
    }) {
      if (category === 'electronics') {
        yield 'phones';
        yield 'laptops';
      } else {
        yield 'shirts';
        yield 'pants';
      }
    },
  });

  // Test that the builder has the correct type after adding dependent parameters
  assertType<
    Equal<
      typeof builder,
      {
        add: <
          P extends Record<
            string,
            | readonly unknown[]
            | Generator
            | ((dependencies: {
                category: 'electronics' | 'clothing';
                subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
              }) => Generator)
          >,
        >(
          param: P,
        ) => GeneratorBuilder<
          {
            category: 'electronics' | 'clothing';
            subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
          } & { [K in keyof P]: Yields<P[K]> }
        >;
        build: () => Generator<
          {
            category: 'electronics' | 'clothing';
            subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
          },
          void,
          unknown
        >;
      }
    >
  >(true);

  // Test the generator's yielded type
  const generator = builder.build();

  // Get the type of the yielded value
  type YieldedType = GeneratorYield<typeof generator>;

  // Verify the yielded type has the correct structure
  assertType<
    Equal<
      YieldedType,
      {
        category: 'electronics' | 'clothing';
        subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
      }
    >
  >(true);
}

// Test chained dependencies
{
  const builder = generatorBuilder()
    .add({
      region: ['North', 'South'] as const,
    })
    .add({
      country: function* ({ region }: { region: 'North' | 'South' }) {
        if (region === 'North') {
          yield 'Canada';
          yield 'Norway';
        } else {
          yield 'Brazil';
          yield 'Australia';
        }
      },
    });

  // Test that the builder has the correct type after chaining
  assertType<
    Equal<
      typeof builder,
      {
        add: <
          P extends Record<
            string,
            | readonly unknown[]
            | Generator
            | ((dependencies: {
                region: 'North' | 'South';
                country: 'Canada' | 'Norway' | 'Brazil' | 'Australia';
              }) => Generator)
          >,
        >(
          param: P,
        ) => GeneratorBuilder<
          {
            region: 'North' | 'South';
            country: 'Canada' | 'Norway' | 'Brazil' | 'Australia';
          } & { [K in keyof P]: Yields<P[K]> }
        >;
        build: () => Generator<
          {
            region: 'North' | 'South';
            country: 'Canada' | 'Norway' | 'Brazil' | 'Australia';
          },
          void,
          unknown
        >;
      }
    >
  >(true);
}

// Test empty builder
{
  const builder = generatorBuilder();

  // Test that the builder has the correct type
  assertType<
    Equal<
      typeof builder,
      {
        add: <
          P extends Record<
            string,
            | readonly unknown[]
            | Generator
            | ((dependencies: NonNullable<unknown>) => Generator)
          >,
        >(
          param: P,
        ) => GeneratorBuilder<{ [K in keyof P]: Yields<P[K]> }>;
        build: () => Generator<NonNullable<unknown>, void, unknown>;
      }
    >
  >(true);
}

// Test the parameter of the generator function
{
  const builder = generatorBuilder({
    category: ['electronics', 'clothing'] as const,
  });

  // Create a function that will be passed to .add()
  const subcategoryGenerator = function* ({
    category,
  }: {
    category: 'electronics' | 'clothing';
  }) {
    if (category === 'electronics') {
      yield 'phones';
      yield 'laptops';
    } else {
      yield 'shirts';
      yield 'pants';
    }
  };

  // Test that the parameter type is correct
  assertType<
    Equal<
      Parameters<typeof subcategoryGenerator>[0],
      {
        category: 'electronics' | 'clothing';
      }
    >
  >(true);

  // Add the function to the builder
  const builderWithSubcategory = builder.add({
    subcategory: subcategoryGenerator,
  });

  // Test that the builder has the correct type after adding the function
  assertType<
    Equal<
      typeof builderWithSubcategory,
      {
        add: <
          P extends Record<
            string,
            | readonly unknown[]
            | Generator
            | ((dependencies: {
                category: 'electronics' | 'clothing';
                subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
              }) => Generator)
          >,
        >(
          param: P,
        ) => GeneratorBuilder<
          {
            category: 'electronics' | 'clothing';
            subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
          } & { [K in keyof P]: Yields<P[K]> }
        >;
        build: () => Generator<
          {
            category: 'electronics' | 'clothing';
            subcategory: 'phones' | 'laptops' | 'shirts' | 'pants';
          },
          void,
          unknown
        >;
      }
    >
  >(true);
}
