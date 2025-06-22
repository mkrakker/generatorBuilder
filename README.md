# Generator Builder

A TypeScript utility for building and composing generators with dependencies.

## Usage

The `generatorBuilder` utility allows you to create generators that yield combinations of values, with support for dependencies between parameters.

### Basic Usage

```typescript
import { generatorBuilder } from 'generator-builder';

// Create a generator with independent parameters
const builder = generatorBuilder({
  color: ['red', 'green', 'blue'],
  size: ['small', 'medium', 'large']
});

// Build and use the generator
const generator = builder.build();

for (const item of generator) {
  console.log(item);
  // Outputs combinations like:
  // { color: 'red', size: 'small' }
  // { color: 'red', size: 'medium' }
  // etc.
}
```

### Adding Dependent Parameters

```typescript
import { generatorBuilder } from 'generator-builder';

const builder = generatorBuilder({
  category: ['electronics', 'clothing', 'food']
})
  .add({
    // Parameter that depends on previously defined parameters
    subcategory: (deps) => {
      if (deps.category === 'electronics') {
        return ['phones', 'laptops', 'tablets'];
      } else if (deps.category === 'clothing') {
        return ['shirts', 'pants', 'shoes'];
      } else {
        return ['fruits', 'vegetables', 'meat'];
      }
    }
  });

const generator = builder.build();

for (const item of generator) {
  console.log(item);
  // Outputs combinations like:
  // { category: 'electronics', subcategory: 'phones' }
  // { category: 'electronics', subcategory: 'laptops' }
  // etc.
}
```

### Chaining Multiple Additions

You can chain multiple `.add()` calls to build complex generators:

```typescript
const builder = generatorBuilder()
  .add({
    region: ['North', 'South', 'East', 'West']
  })
  .add({
    country: ({ region }) => {
      // Return countries based on region
      const countryMap = {
        North: ['Canada', 'Norway'],
        South: ['Brazil', 'Australia'],
        East: ['Japan', 'China'],
        West: ['USA', 'UK']
      };
      return countryMap[region];
    }
  })
  .add({
    city: ({ country }) => {
      // Return cities based on country
      const cityMap = {
        Canada: ['Toronto', 'Vancouver'],
        Norway: ['Oslo', 'Bergen'],
        // ... other countries and cities
      };
      return cityMap[country] || [];
    }
  });
```

## API Reference

### `generatorBuilder(initialParameters?)`

Creates a new generator builder with optional initial parameters.

**Parameters:**
- `initialParameters` (optional): An object where keys are parameter names and values are arrays of possible values.

**Returns:** A `GeneratorBuilder` instance.

### `GeneratorBuilder.add(param)`

Adds new parameters to the generator.

**Parameters:**
- `param`: An object where keys are parameter names and values are either:
  - Arrays of possible values
  - Generator functions that might that take dependencies (previously defined parameters)
  - Functions that take dependencies (previously defined parameters) and return arrays or generators

**Returns:** A new `GeneratorBuilder` instance with the added parameters.

### `GeneratorBuilder.build()`

Builds and returns a generator that yields all possible combinations of the defined parameters.

**Returns:** A generator that yields objects containing all parameter combinations.

## License

MIT
