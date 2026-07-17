import { describe, expect, it, vi } from "vitest";

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

  it("normalizes explicit seeds and falls back to the current timestamp", () => {
    const seeded = new Random(42n);
    expect(seeded.getSeed()).toBe("42");

    const now = vi.spyOn(Date, "now").mockReturnValue(1_725_000_000_000);

    try {
      const fallback = new Random();
      expect(fallback.getSeed()).toBe("1725000000000");
    } finally {
      now.mockRestore();
    }
  });

  it("hashes strings deterministically", () => {
    expect(Random.hashString("seed")).toBe(Random.hashString("seed"));
    expect(Random.hashString("seed")).not.toBe(Random.hashString("other-seed"));
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

  it("supports nextNumber for both number and bigint ranges", () => {
    const random = new Random("next-number");

    const int = random.nextNumber(-5, 5);
    expect(int).toBeGreaterThanOrEqual(-5);
    expect(int).toBeLessThan(5);

    const bigint = random.nextNumber(10n, 20n);
    expect(bigint).toBeGreaterThanOrEqual(10n);
    expect(bigint).toBeLessThan(20n);
  });

  it("rejects mixed argument types for nextNumber", () => {
    const random = new Random("mixed-next-number");

    expect(() =>
      // @ts-expect-error
      random.nextNumber(1 as number | bigint, 2n as number | bigint),
    ).toThrow("nextNumber requires both arguments to be of the same type.");
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
