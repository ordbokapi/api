import type { InspectOptionsStylized } from 'util';
import { DeferredIterable } from './deferred-iterable.types';

/**
 * Provides a type that represents an iterable of a union of types. When
 * iterated over, it will yield the values of the first iterable, then the
 * values of the second iterable, and so on.
 */
export class UnionIterable<T = never> implements Iterable<T> {
  #iterables: Iterable<T>[];

  constructor(iterables?: Iterable<T>[]) {
    this.#iterables = iterables ?? [];
  }

  /**
   * Iterates over the iterables in the union and yields their values.
   */
  *[Symbol.iterator](): Iterator<T> {
    for (const iterable of this.#iterables) {
      yield* iterable;
    }
  }

  /**
   * Returns a new union iterable that is a union of this iterable and the
   * given iterable.
   * @param other The iterable to union with.
   * @returns A new union iterable that is a union of this iterable and the
   * given iterable.
   */
  union<U>(other: Iterable<U>): UnionIterable<T | U> {
    return new UnionIterable(
      (this.#iterables as Iterable<T | U>[]).concat(other),
    );
  }

  /**
   * Concatenates the given iterables to this union iterable. This mutates the
   * union iterable.
   * @param iterables The iterables to concatenate.
   * @returns This union iterable.
   */
  concat(...iterables: Iterable<T>[]): this {
    this.#iterables.push(...iterables);

    return this;
  }

  /**
   * The size of the union iterable. This is the number of iterables in the
   * union, not the total number of elements in all the iterables.
   */
  get size(): number {
    return this.#iterables.length;
  }

  /**
   * Defer a map operation to be performed when the iterable is iterated over.
   * Returns a new deferred iterable.
   * @param mapFn The map function to defer.
   */
  map<TMapped>(mapFn: (value: T) => TMapped): DeferredIterable<TMapped> {
    return new DeferredIterable(this).map(mapFn);
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
      return options.stylize('[UnionIterable]', 'special');
    }

    const newOptions = Object.assign({}, options, {
      depth:
        options.depth === null || options.depth === undefined
          ? null
          : options.depth - 1,
    });

    const arr = Array.from(this);
    const arrayInspect = inspect(arr, newOptions);

    return `UnionIterable(${arr.length}) {${arrayInspect.slice(1, -1)}}`;
  }
}
