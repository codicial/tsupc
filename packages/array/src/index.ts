/**
 * Returns `true` when an array contains a value that matches `item` using
 * strict equality (`===`).
 *
 * This helper does not coerce types, so values like `1` and `"1"` are treated
 * as different, and `NaN` does not match itself.
 *
 * @param array - The array to search.
 * @param item - The value to compare against each array element.
 */
export function contains<T>(array: readonly T[], item: unknown): boolean {
  for (let index = 0; index < array.length; index += 1) {
    if (array[index] === item) {
      return true;
    }
  }

  return false;
}
