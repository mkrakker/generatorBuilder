import { generatorBuilder } from '../src';

describe('generatorBuilder functional tests', () => {
  it('should generate combinations for basic independent parameters', () => {
    const builder = generatorBuilder({
      color: ['red', 'blue'],
      size: ['small', 'large'],
    });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { color: 'red', size: 'small' },
      { color: 'red', size: 'large' },
      { color: 'blue', size: 'small' },
      { color: 'blue', size: 'large' },
    ]);
  });

  it('should handle dependent parameters correctly', () => {
    const builder = generatorBuilder({
      category: ['electronics', 'clothing'] as const,
    }).add({
      subcategory: function* ({ category }) {
        if (category === 'electronics') {
          yield 'phone';
          yield 'laptop';
        } else {
          yield 'shirt';
          yield 'pants';
        }
      },
    });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { category: 'electronics', subcategory: 'phone' },
      { category: 'electronics', subcategory: 'laptop' },
      { category: 'clothing', subcategory: 'shirt' },
      { category: 'clothing', subcategory: 'pants' },
    ]);
  });

  it('should return an empty array for a builder with no parameters', () => {
    const builder = generatorBuilder();
    const result = Array.from(builder.build());
    expect(result).toEqual([]);
  });

  it('should handle generator functions passed to the add method', () => {
    function* numbers() {
      yield 1;
      yield 2;
    }

    const builder = generatorBuilder({
      letter: ['a', 'b'],
    }).add({
      number: numbers,
    });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { letter: 'a', number: 1 },
      { letter: 'a', number: 2 },
      { letter: 'b', number: 1 },
      { letter: 'b', number: 2 },
    ]);
  });

  it('should handle a regular function that returns a generator', () => {
    const builder = generatorBuilder({
      type: ['A', 'B'] as const,
    }).add({
      value: ({ type }) => {
        // This is a regular function that returns a new generator instance.
        function* generator() {
          if (type === 'A') {
            yield 1;
            yield 2;
          } else {
            yield 3;
            yield 4;
          }
        }
        return generator();
      },
    });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { type: 'A', value: 1 },
      { type: 'A', value: 2 },
      { type: 'B', value: 3 },
      { type: 'B', value: 4 },
    ]);
  });

  it('should handle parameters with empty arrays by skipping them', () => {
    const builder = generatorBuilder({
      color: ['red', 'blue'],
      size: [],
      variant: ['A'],
    });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { color: 'red', variant: 'A' },
      { color: 'blue', variant: 'A' },
    ]);
  });

  it('should handle complex chained dependencies', () => {
    const builder = generatorBuilder({
      continent: ['North America', 'Europe'] as const,
    })
      .add({
        country: function* ({ continent }) {
          if (continent === 'North America') {
            yield 'USA';
            yield 'Canada';
          } else {
            yield 'Germany';
          }
        },
      })
      .add({
        city: function* ({ country }) {
          if (country === 'USA') yield 'New York';
          if (country === 'Canada') yield 'Toronto';
          if (country === 'Germany') yield 'Berlin';
        },
      });

    const result = Array.from(builder.build());

    expect(result).toEqual([
      { continent: 'North America', country: 'USA', city: 'New York' },
      { continent: 'North America', country: 'Canada', city: 'Toronto' },
      { continent: 'Europe', country: 'Germany', city: 'Berlin' },
    ]);
  });
});
