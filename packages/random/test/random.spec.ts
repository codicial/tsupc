import { describe, expect, it } from "vitest";

import { Random } from "../src";

describe("Random", () => {
  it("produces the same sequence for the same seed", () => {
    const left = new Random("shared-seed");
    const right = new Random("shared-seed");

    expect(left.nextUint32()).toBe(right.nextUint32());
    expect(left.nextBoolean()).toBe(right.nextBoolean());
    expect(left.nextFloat()).toBe(right.nextFloat());
    expect(left.nextInt(-25, 25)).toBe(right.nextInt(-25, 25));
    expect(left.nextBigInt(0n, 10_000n)).toBe(right.nextBigInt(0n, 10_000n));
    expect(left.nextChoice(["a", "b", "c"])).toBe(right.nextChoice(["a", "b", "c"]));
    expect(left.nextShuffle([1, 2, 3, 4, 5])).toEqual(right.nextShuffle([1, 2, 3, 4, 5]));
  });

  it("returns values inside the expected scalar ranges", () => {
    const random = new Random("range-check");

    const uint32 = random.nextUint32();
    expect(uint32).toBeGreaterThanOrEqual(0);
    expect(uint32).toBeLessThan(0x1_0000_0000);

    const float = random.nextFloat();
    expect(float).toBeGreaterThanOrEqual(0);
    expect(float).toBeLessThan(1);

    const int = random.nextInt(-10, 10);
    expect(int).toBeGreaterThanOrEqual(-10);
    expect(int).toBeLessThan(10);

    const bigint = random.nextBigInt(-10n, 10n);
    expect(bigint).toBeGreaterThanOrEqual(-10n);
    expect(bigint).toBeLessThan(10n);
  });

  it("rejects invalid number bounds for nextInt", () => {
    const random = new Random("invalid-next-int");

    expect(() => random.nextInt(10, 10)).toThrow(
      "Minimum value must be less than maximum value for nextInt.",
    );
    expect(() => random.nextInt(0.5, 10)).toThrow("Values must be safe integers.");
    expect(() => random.nextInt(0, 0x1_0000_0001)).toThrow(
      "Range for nextInt must be a safe integer and <= 2^32.",
    );
  });

  it("rejects invalid bigint bounds for nextBigInt", () => {
    const random = new Random("invalid-next-bigint");

    expect(() => random.nextBigInt(5n, 5n)).toThrow(
      "Minimum value must be less than maximum value for nextBigInt.",
    );
    expect(() => random.nextBigInt(0n, (1n << 64n) + 1n)).toThrow(
      "Range for nextBigInt must be <= 2^64.",
    );
  });

  it("returns array members for nextChoice and throws on empty arrays", () => {
    const random = new Random("choice");
    const options = ["red", "green", "blue"];

    expect(options).toContain(random.nextChoice(options));
    expect(() => random.nextChoice([])).toThrow(
      "Cannot select a random choice from an empty array.",
    );
  });

  it("returns a shuffled copy without mutating the original array", () => {
    const random = new Random("shuffle");
    const original = [1, 2, 3, 4, 5];

    const shuffled = random.nextShuffle(original);

    expect(shuffled).not.toBe(original);
    expect(original).toEqual([1, 2, 3, 4, 5]);
    expect([...shuffled].sort((left, right) => left - right)).toEqual(original);
  });
});
