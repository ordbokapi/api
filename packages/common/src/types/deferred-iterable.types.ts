import type { InspectOptionsStylized } from 'util';

/**
 * A deferred iterable is an iterable that performs some operations on each
 * element only when it is iterated over.
 */
export class DeferredIterable<T> implements Iterable<T> {
  #originalData: Iterable<unknown>;
  #mapFns: Array<(value: unknown) => unknown>;

  constructor(originalData: Iterable<T>) {
    if (originalData instanceof DeferredIterable) {
      this.#originalData = originalData.#originalData;
      this.#mapFns = originalData.#mapFns.slice();
    } else {
      this.#originalData = originalData;
      this.#mapFns = [];
    }
  }

  /**
   * Defer a map operation to be performed when the iterable is iterated over.
   * Returns a new deferred iterable.
   */
  map<TMapped>(mapFn: (value: T) => TMapped): DeferredIterable<TMapped> {
    const newIterable = new DeferredIterable(this.#originalData);

    newIterable.#mapFns = this.#mapFns.concat(mapFn);

    return newIterable as DeferredIterable<TMapped>;
  }

  *[Symbol.iterator](): Iterator<T> {
    for (const value of this.#originalData) {
      let newValue: unknown = value;

      for (const map of this.#mapFns) {
        newValue = map(newValue);
      }

      yield newValue as T;
    }
  }

  /**
   * Custom inspect function for Node.js `util.inspect`. Allows for a more
   * readable output in the console.
   */
  [Symbol.for('nodejs.util.inspect.custom')](
    depth: number,
    options: InspectOptionsStylized,
    inspect: (value: unknown, options: InspectOptionsStylized) => string,
  ): string {
    if (depth < 0) {
      return options.stylize('[DeferredIterable]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth:
        options.depth === null || options.depth === undefined
          ? null
          : options.depth - 1,
    });

    const arr = Array.from(this);
    const arrayInspect = inspect(arr, newOptions);

    return `DeferredIterable(${arr.length}) {${arrayInspect.slice(1, -1)}}`;
  }
}
