/**
 * Creates a debounced wrapper that delays invocation until calls stop for a
 * given amount of time.
 *
 * Each new call clears the previous timer and starts a new one.
 *
 * @param func - The function to invoke after the debounce delay.
 * @param delay - The debounce window in milliseconds.
 * @returns A wrapper function with the same parameter list as `func`.
 *
 * The returned wrapper always returns `void`, even if `func` returns a value,
 * because invocation is deferred until the debounce delay elapses.
 */
export function debounce<TArgs extends unknown[], TResult>(
  func: (...args: TArgs) => TResult,
  delay: number,
): (...args: TArgs) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (...args: TArgs): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
