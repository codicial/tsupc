/** The 64-bit FNV-1a offset basis used to initialize seed hashing. */
export const FNV_OFFSET_BASIS_64 = 0xcbf29ce484222325n;

/** The 64-bit FNV-1a prime used to mix seed bytes into generator state. */
export const FNV_PRIME_64 = 0x100000001b3n;

/** A mask that truncates intermediate values to an unsigned 64-bit range. */
export const FNV_MASK_64: bigint = (1n << 64n) - 1n;

/** The MMIX linear congruential multiplier used to advance generator state. */
export const MMIX_LCG_MULTIPLIER = 6364136223846793005n;

/** The MMIX linear congruential increment used to advance generator state. */
export const MMIX_LCG_INCREMENT = 1442695040888963407n;

/** The size of the unsigned 32-bit integer domain. */
export const UINT32_DOMAIN = 0x1_0000_0000;

/** The size of the unsigned 64-bit integer domain. */
export const UINT64_DOMAIN: bigint = 1n << 64n;

/**
 * A deterministic pseudo-random number generator backed by a seeded 64-bit LCG.
 *
 * Seed initialization uses FNV-1a hashing, and state advancement uses MMIX
 * linear congruential generator constants.
 *
 * This generator is suitable for repeatable utility behavior, but not for
 * cryptographic use.
 */
export class Random {
  private state: bigint;
  protected seed: string;

  /**
   * Creates a new generator from a stringified seed value.
   *
   * @param seed - An optional seed. When omitted, the current timestamp is used.
   */
  constructor(seed?: string | number | bigint) {
    if (seed === undefined || seed === null) {
      this.seed = `${Date.now()}`;
    } else {
      this.seed = seed.toString();
    }

    this.state = Random.hashString(this.seed);
  }

  /**
   * Hashes a string into a deterministic unsigned 64-bit value.
   *
   * @param str - The string to hash.
   * @returns The hashed seed value.
   */
  static hashString(str: string): bigint {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    let hash = FNV_OFFSET_BASIS_64;

    for (let i = 0; i < bytes.length; i++) {
      hash ^= BigInt(bytes[i]!);
      hash = (hash * FNV_PRIME_64) & FNV_MASK_64;
    }

    return hash;
  }

  /** Advances the internal state and returns the next unsigned 64-bit value. */
  private advance(): bigint {
    return (this.state = (MMIX_LCG_MULTIPLIER * this.state + MMIX_LCG_INCREMENT) & FNV_MASK_64);
  }

  /**
   * Returns the next unsigned 32-bit integer.
   *
   * @returns A value in the range `0` to `2^32 - 1`.
   */
  public nextUint32(): number {
    return Number(this.advance() >> 32n);
  }

  /**
   * Returns the next unsigned 64-bit integer.
   *
   * @returns A value in the range `0n` to `2^64 - 1n`.
   */
  public nextUint64(): bigint {
    return this.advance();
  }

  /**
   * Returns the next pseudo-random boolean.
   *
   * @returns `true` or `false`.
   */
  public nextBoolean(): boolean {
    return this.nextUint32() >= 0x80000000;
  }

  /**
   * Returns the next pseudo-random floating-point number.
   *
   * @returns A value in the half-open range `[0, 1)`.
   */
  public nextFloat(): number {
    return Number(this.advance() >> 11n) / 9007199254740992;
  }

  /**
   * Returns a pseudo-random safe integer within a half-open range.
   *
   * @param min - The inclusive lower bound.
   * @param max - The exclusive upper bound.
   * @returns A value in the range `[min, max)`.
   */
  public nextInt(min: number, max: number): number {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
      throw new Error("Values must be safe integers.");
    }

    if (min >= max) {
      throw new Error("Minimum value must be less than maximum value for nextInt.");
    }

    const range = max - min;

    if (!Number.isSafeInteger(range) || range > UINT32_DOMAIN) {
      throw new Error("Range for nextInt must be a safe integer and <= 2^32.");
    }

    const limit = UINT32_DOMAIN - (UINT32_DOMAIN % range);
    let x: number;

    do {
      x = this.nextUint32();
    } while (x >= limit);

    return min + (x % range);
  }

  /**
   * Returns a pseudo-random bigint within a half-open range.
   *
   * @param min - The inclusive lower bound.
   * @param max - The exclusive upper bound.
   * @returns A value in the range `[min, max)`.
   */
  public nextBigInt(min: bigint, max: bigint): bigint {
    if (min >= max) {
      throw new Error("Minimum value must be less than maximum value for nextBigInt.");
    }

    const range = max - min;

    if (range > UINT64_DOMAIN) {
      throw new Error("Range for nextBigInt must be <= 2^64.");
    }

    const limit = UINT64_DOMAIN - (UINT64_DOMAIN % range);
    let x: bigint;

    do {
      x = this.nextUint64();
    } while (x >= limit);

    return min + (x % range);
  }

  public nextNumber(min: number, max: number): number;
  public nextNumber(min: bigint, max: bigint): bigint;

  /**
   * Returns a pseudo-random number using either the integer or bigint range API.
   *
   * @param min - The inclusive lower bound.
   * @param max - The exclusive upper bound.
   * @returns A value in the range `[min, max)` using the input type.
   */
  public nextNumber<T extends number | bigint>(min: T, max: T): T {
    if (typeof min === "number" && typeof max === "number") {
      return this.nextInt(min, max) as T;
    }

    if (typeof min === "bigint" && typeof max === "bigint") {
      return this.nextBigInt(min, max) as T;
    }

    throw new Error("nextNumber requires both arguments to be of the same type.");
  }

  /**
   * Returns a pseudo-random element from a non-empty array.
   *
   * @param array - The source array.
   * @returns A single element from `array`.
   */
  public nextChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot select a random choice from an empty array.");
    }

    const index = this.nextInt(0, array.length);
    return array[index]!;
  }

  /**
   * Returns a shuffled copy of an array using the Fisher-Yates algorithm.
   *
   * @param array - The source array.
   * @returns A new array with the same elements in pseudo-random order.
   */
  public nextShuffle<T>(array: T[]): T[] {
    const shuffled = array.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled;
  }

  /**
   * Returns the normalized seed string used by this generator.
   *
   * @returns The generator seed.
   */
  public getSeed(): string {
    return this.seed;
  }
}
