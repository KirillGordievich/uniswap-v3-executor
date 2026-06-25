export class IntRange {
  private _lower: number;
  private _upper: number;

  constructor(lower: number, upper?: number) {
    this._lower = lower;
    this._upper = upper ?? lower;
  }

  get lower(): number {
    return this._lower;
  }

  get upper(): number {
    return this._upper;
  }

  clone(): IntRange {
    return new IntRange(this.lower, this.upper);
  }

  valid(): boolean {
    return this.lower <= this.upper;
  }

  size(): number {
    return this.upper - this.lower;
  }

  singleton(): boolean {
    return this.lower === this.upper;
  }

  equals(other: IntRange): boolean {
    return this.lower === other.lower && this.upper === other.upper;
  }

  includes(other: IntRange): boolean {
    return this.lower <= other.lower && other.upper <= this.upper;
  }

  contains(integer: number): boolean {
    return this.lower <= integer && integer <= this.upper;
  }

  overlaps(other: IntRange): boolean {
    return this.lower <= other.upper && other.lower <= this.upper;
  }

  difference(other: IntRange): IntRange[] {
    if (!this.overlaps(other)) {
      return [this.clone()];
    }

    if (other.includes(this)) {
      return [];
    }

    const left = new IntRange(this.lower, other.lower - 1);
    const right = new IntRange(other.upper + 1, this.upper);

    return [left, right].filter((range) => range.valid());
  }

  expandLeft(size: number): this {
    this._lower -= size;

    return this;
  }

  expandRight(size: number): this {
    this._upper += size;

    return this;
  }

  expandBilateral(size: number): this {
    return this.expandLeft(size).expandRight(size);
  }
}
