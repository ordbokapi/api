import { Injectable, Logger, Inject } from '@nestjs/common';
import { createHash } from 'crypto';
import { BuildInfoProvider, ICacheProvider, TTLBucket } from '../../providers';

/**
 * Type that returns an almost equivalent type to the original, but with all
 * methods that were not async replaced with async versions.
 */
export type Asyncify<T> = {
  [K in keyof T]: T[K] extends (...args: any) => Promise<unknown>
    ? T[K]
    : T[K] extends (...args: infer A) => infer R
      ? (...args: A) => Promise<R>
      : T[K];
};

/**
 * Creates proxies for class instances to cache results of method calls.
 */
@Injectable()
export class CacheWrapperService {
  private readonly logger = new Logger(CacheWrapperService.name);

  constructor(
    @Inject('ICacheProvider') private cacheProvider: ICacheProvider,
    private buildInfo: BuildInfoProvider,
  ) {}

  /**
   * Creates a proxy for the given class instance, caching the results of method calls.
   * @param instance The class instance to create a proxy for.
   */
  createProxy<T extends object>(instance: T): Asyncify<T> {
    const wrappedFns = new Map<
      string | number | symbol,
      (...args: any[]) => any
    >();
    const proto = Object.getPrototypeOf(instance);
    const keys = Object.getOwnPropertyNames(proto) as (keyof T)[];

    for (const key of keys) {
      if (key === 'constructor' || typeof proto[key] !== 'function') {
        continue;
      }

      const originalFn = proto[key] as (...args: any[]) => any;
      wrappedFns.set(key, this.#wrapFunction(key, originalFn, instance));
    }

    return new Proxy(instance, {
      get(target, prop, receiver) {
        if (wrappedFns.has(prop)) {
          return wrappedFns.get(prop);
        }

        return Reflect.get(target, prop, receiver);
      },
    }) as Asyncify<T>;
  }

  #wrapFunction<T extends object>(
    key: keyof T,
    fn: (...args: any[]) => any,
    instance: T,
  ): (...args: any[]) => any {
    return async (...args: any[]) => {
      const cacheKey = this.#getCacheKey(instance, key, args);

      try {
        const cachedResult = await this.cacheProvider.get(cacheKey);

        if (cachedResult) {
          return cachedResult;
        }
      } catch (err) {
        this.logger.error(`Failed to retrieve cache for key: ${cacheKey}`, err);
      }

      const result = await fn.apply(instance, args);

      try {
        await this.cacheProvider.set(cacheKey, result, TTLBucket.Short);
      } catch (err) {
        this.logger.error(`Failed to cache result for key: ${cacheKey}`, err);
      }

      return result;
    };
  }

  #getCacheKey<T extends object>(
    instance: T,
    key: keyof T,
    args: any[],
  ): string {
    const className = instance.constructor.name;
    const methodName = key.toString();
    const argsHash = createHash('sha1')
      .update(JSON.stringify(args))
      .digest('hex');

    return `cache:${this.buildInfo.buildId}:${className}:${methodName}:${argsHash}`;
  }
}
