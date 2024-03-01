export class TwoWayMap<L extends string | number, R extends string | number> {
  private map: Record<L, R> = {} as Record<L, R>;
  private reverseMap: Record<R, L> = {} as Record<R, L>;

  constructor(entries: [L, R][]) {
    entries.forEach(([left, right]) => {
      this.map[left] = right;
      this.reverseMap[right] = left;
    });
  }

  get(left: L): R {
    return this.map[left];
  }

  getReverse(right: R): L {
    return this.reverseMap[right];
  }

  has(left: string | number): left is L {
    return left in this.map;
  }

  hasReverse(right: string | number): right is R {
    return right in this.reverseMap;
  }

  getEntries(): [L, R][] {
    return Object.entries(this.map) as [L, R][];
  }

  getReverseEntries(): [R, L][] {
    return Object.entries(this.reverseMap) as [R, L][];
  }

  getKeys(): L[] {
    return Object.keys(this.map) as L[];
  }

  getReverseKeys(): R[] {
    return Object.keys(this.reverseMap) as R[];
  }

  getValues(): R[] {
    return Object.values(this.map) as R[];
  }

  getReverseValues(): L[] {
    return Object.values(this.reverseMap) as L[];
  }

  get size(): number {
    return Object.keys(this.map).length;
  }
}
