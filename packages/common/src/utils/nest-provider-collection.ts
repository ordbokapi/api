import { Provider } from '@nestjs/common';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';
import { DEV_ONLY_WATERMARK } from './dev-only';
import { isProd } from './is-prod';
import { isObject } from './is-object';

export type ClassExports<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T];

export type ClassExportsArray<T extends Record<string, any>> = Array<
  T[ClassExports<T>]
>;

/**
 * An iterable collection of Nest.js providers.
 */
export class NestProviderCollection<T extends Provider[]> {
  readonly #providers: T;

  constructor(providers: Iterable<T[number]>) {
    this.#providers = Array.from(providers) as T;
  }

  /**
   * Creates a collection from the export object of only the exported injectable
   * classes.
   *
   * @example
   * ```ts
   * import { Module } from '@nestjs/common';
   * import { NestClassCollection } from './utils';
   * import * as providers from './providers';
   *
   * @Module({
   *   providers: NestClassCollection.fromInjectables(providers).toArray(),
   * })
   * export class AppModule {}
   * ```
   */
  static fromInjectables<T extends Record<string, any>>(
    providers: T,
  ): NestProviderCollection<ClassExportsArray<T>> {
    return new NestProviderCollection(
      Object.values(providers).filter(
        (provider) =>
          isObject(provider) &&
          Reflect.getMetadata(INJECTABLE_WATERMARK, provider),
      ),
    );
  }

  /**
   * Returns an array of the providers in the collection.
   */
  toArray(): T {
    return this.#providers.slice() as T;
  }

  /**
   * Filters the provider array to only include classes suitable for the
   * current environment.
   *
   * In other words, if the current environment is production, then development-
   * environment-only classes will be filtered out.
   */
  forEnvironment(): NestProviderCollection<T> {
    const prod = isProd();

    return new NestProviderCollection(
      this.#providers.filter((provider) => {
        if (Reflect.getMetadata(DEV_ONLY_WATERMARK, provider)) {
          return !prod;
        }

        return true;
      }) as T,
    );
  }

  /**
   * Filters the given providers out.
   */
  except<E extends T>(
    ...providers: E
  ): NestProviderCollection<Exclude<T[number], E[number]>[]> {
    return new NestProviderCollection(
      this.#providers.filter(
        (provider) => !providers.includes(provider),
      ) as Exclude<T[number], E[number]>[],
    );
  }

  /**
   * Concatenates the given collection of providers to the current collection.
   */
  concat<C extends Provider[]>(
    collection: NestProviderCollection<C> | C,
  ): NestProviderCollection<[...T, ...C]> {
    return new NestProviderCollection<[...T, ...C]>(
      this.#providers.concat(
        collection instanceof NestProviderCollection
          ? collection.#providers
          : collection,
      ),
    );
  }

  /**
   * Adds the given provider to the collection.
   */
  add<P extends Provider>(provider: P): NestProviderCollection<[...T, P]> {
    return new NestProviderCollection([...this.#providers, provider]) as any;
  }

  /**
   * Adds the given provider to the collection if the condition is true.
   */
  addIf<P extends Provider>(
    condition: unknown,
    provider: P,
  ): NestProviderCollection<[...T, P]> | NestProviderCollection<T> {
    return condition ? this.add(provider) : this;
  }

  /**
   * Iterates over the providers.
   */
  *[Symbol.iterator](): IterableIterator<T[number]> {
    for (const provider of this.#providers) {
      yield provider;
    }
  }
}
