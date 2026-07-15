/**
 * Creates a debounced wrapper that delays invocation until calls stop for a
 * given amount of time.
 *
 * Each new call clears the previous timer and starts a new one.
 *
 * @param func - The function to invoke after the debounce delay.
 * @param delay - The debounce window in milliseconds.
 * @returns A wrapper function with the same parameter list as `func`.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function (...args: Parameters<T>): void {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
