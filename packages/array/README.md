# `@tsupc/array`

Small, tree-shakeable array helpers for TypeScript and JavaScript.

## Install

```sh
npm install @tsupc/array
```

## Usage

```ts
import { contains } from "@tsupc/array";

contains([1, 2, 3], 2);
// => true

contains(["1", "2", "3"], 2);
// => false
```

CommonJS is supported as well:

```js
const { contains } = require("@tsupc/array");
```

## API

### `contains(array, item)`

Returns `true` when `array` contains `item` using strict equality (`===`).

```ts
contains([1, 2, 3], 2);
// => true
```

Important behavior:

- No type coercion is performed, so `1` and `"1"` are treated as different values.
- `NaN` does not match itself because the helper uses `===`.
- The input array is never modified.

## License

MIT
