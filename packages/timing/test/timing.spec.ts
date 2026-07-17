import { afterEach, describe, expect, it, vi } from "vitest";

import { debounce } from "../src";

describe("debounce", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("delays invocation until the debounce window elapses", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced("first");

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(49);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
  });

  it("uses only the latest call when invoked repeatedly", () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced("a");
    vi.advanceTimersByTime(50);
    debounced("b");
    vi.advanceTimersByTime(50);
    debounced("c");
    vi.advanceTimersByTime(99);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("always returns undefined from the debounced wrapper", () => {
    vi.useFakeTimers();
    const debounced = debounce((value: string) => value.length, 25);

    expect(debounced("hello")).toBeUndefined();
  });
});
