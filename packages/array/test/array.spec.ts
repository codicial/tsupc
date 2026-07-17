import { describe, expect, it } from "vitest";

import { contains } from "../src";

describe("contains", () => {
  const testIntArray = [1, 2, 3, 4, 5];
  const testStringArray = ["1", "2", "3", "4", "5"];
  const testMixedArray = [1, "2", 3, "4", 5];

  it("returns true when the array contains the item", () => {
    expect(contains(testIntArray, 1)).toBe(true);
    expect(contains(testIntArray, 2)).toBe(true);
    expect(contains(testIntArray, 3)).toBe(true);
    expect(contains(testIntArray, 4)).toBe(true);
    expect(contains(testIntArray, 5)).toBe(true);

    expect(contains(testStringArray, "1")).toBe(true);
    expect(contains(testStringArray, "2")).toBe(true);
    expect(contains(testStringArray, "3")).toBe(true);
    expect(contains(testStringArray, "4")).toBe(true);
    expect(contains(testStringArray, "5")).toBe(true);
  });

  it("returns false when the array does not contain the item", () => {
    expect(contains(testIntArray, -1)).toBe(false);
    expect(contains(testIntArray, 0)).toBe(false);
    expect(contains(testIntArray, 6)).toBe(false);

    expect(contains(testStringArray, "-1")).toBe(false);
    expect(contains(testStringArray, "0")).toBe(false);
    expect(contains(testStringArray, "6")).toBe(false);
  });

  it("only validates using strict equals", () => {
    expect(contains(testMixedArray, "1")).toBe(false);
    expect(contains(testMixedArray, 2)).toBe(false);
    expect(contains(testMixedArray, "3")).toBe(false);
    expect(contains(testMixedArray, 4)).toBe(false);
    expect(contains(testMixedArray, "5")).toBe(false);
  });

  it("does not treat NaN as matching itself", () => {
    expect(contains([Number.NaN], Number.NaN)).toBe(false);
  });
});
