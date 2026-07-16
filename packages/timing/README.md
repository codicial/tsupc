# `@tsupc/timing`

Small timing utilities for TypeScript and JavaScript.

`@tsupc/timing` currently exports a typed `debounce` helper for delaying function calls until activity has settled.

## Install

```sh
npm install @tsupc/timing
```

## Usage

```ts
import { debounce } from "@tsupc/timing";

const saveDraft = debounce((value: string) => {
  console.log("saving", value);
}, 250);

saveDraft("a");
saveDraft("ab");
saveDraft("abc");
```

CommonJS is supported as well:

```js
const { debounce } = require("@tsupc/timing");
```

## API

### `debounce(func, delay)`

Creates a wrapper that waits `delay` milliseconds after the most recent call before invoking `func`.

- The wrapper preserves the parameter list of the original function.
- Each new call clears the previous timer and starts a new one.
- `func` may return any type, but the debounced wrapper always returns `void`.

## When To Use It

Typical cases include:

- resize or scroll handlers
- search input updates
- autosave triggers
- repeated UI events that should settle before running

## License

MIT
