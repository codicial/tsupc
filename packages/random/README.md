# `@tsupc/random`

Deterministic pseudo-random utilities for TypeScript and JavaScript.

`@tsupc/random` provides a seeded `Random` class for repeatable values across runs, making it useful for tests, procedural content, fixtures, shuffling, and any workflow where reproducibility matters.

## Install

```sh
npm install @tsupc/random
```

## Usage

```ts
import { Random } from "@tsupc/random";

const random = new Random("demo-seed");

const id = random.nextUint32();
const enabled = random.nextBoolean();
const opacity = random.nextFloat();
const index = random.nextInt(0, 10);
const large = random.nextBigInt(0n, 10_000n);
const color = random.nextChoice(["red", "green", "blue"]);
const order = random.nextShuffle(["a", "b", "c"]);
```

CommonJS is supported as well:

```js
const { Random } = require("@tsupc/random");
```

## API

### `new Random(seed?)`

Creates a deterministic generator from a `string`, `number`, or `bigint` seed. When omitted, the current timestamp is used.

### `random.nextUint32()`

Returns an unsigned 32-bit integer in the range `0` to `2^32 - 1`.

### `random.nextUint64()`

Returns an unsigned 64-bit `bigint` in the range `0n` to `2^64 - 1n`.

### `random.nextBoolean()`

Returns `true` or `false`.

### `random.nextFloat()`

Returns a floating-point number in the half-open range `[0, 1)`.

### `random.nextInt(min, max)`

Returns a safe integer in the half-open range `[min, max)`.

### `random.nextBigInt(min, max)`

Returns a `bigint` in the half-open range `[min, max)`.

### `random.nextNumber(min, max)`

Dispatches to `nextInt` or `nextBigInt` based on the argument type.

### `random.nextChoice(array)`

Returns a pseudo-random element from a non-empty array.

### `random.nextShuffle(array)`

Returns a shuffled copy of the input array without mutating the original.

### `random.getSeed()`

Returns the normalized string seed used by the generator.

## Notes

- Seed hashing uses FNV-1a.
- State advancement uses MMIX linear congruential generator constants.
- This package is deterministic, not cryptographically secure.

## License

MIT
