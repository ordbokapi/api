import { Injectable, Logger, Inject } from '@nestjs/common';
import { Dictionary } from '../models';
import { ICacheProvider, TTLBucket } from '../../providers';
import { createHash } from 'crypto';

@Injectable()
export class OrdboekeneApiService {
  private readonly logger = new Logger(OrdboekeneApiService.name);
  private readonly baseUrl = 'https://ord.uib.no';
  private readonly requestMap = new Map<string, Promise<any>>();

  constructor(
    @Inject('ICacheProvider') private cacheProvider: ICacheProvider,
  ) {}

  suggest(
    word: string,
    dictionaries?: Dictionary[],
    maxCount?: number,
  ): Promise<any> {
    return this.request<any>('api/suggest', {
      q: word,
      ...(dictionaries ? { dict: this.getDictParam(dictionaries) } : {}),
      ...(maxCount ? { n: maxCount } : {}),
    });
  }

  articles(word: string, dictionaries: Dictionary[]): Promise<any> {
    return this.request<any>('api/articles', {
      w: word,
      scope: 'e',
      ...(dictionaries ? { dict: this.getDictParam(dictionaries) } : {}),
    });
  }

  article(id: number, dictionary: Dictionary): Promise<any> {
    return this.request<any>(
      `${this.getDictParam(dictionary)}/article/${id}.json`,
    );
  }

  concepts(dictionary: Dictionary): Promise<any> {
    return this.request<any>(
      `${this.getDictParam(dictionary)}/concepts.json`,
      undefined,
      TTLBucket.Short,
    );
  }

  private request<T>(
    path: string,
    params?: { [key: string]: string | number },
    cacheBucket: TTLBucket = TTLBucket.Long,
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}/${path}`);

    if (params) {
      Object.keys(params).forEach((key) =>
        url.searchParams.set(key, params[key].toString()),
      );
    }

    const urlString = url.toString();
    const cacheKey = this.generateCacheKey(urlString);

    let requestPromise = this.requestMap.get(cacheKey);

    if (requestPromise) {
      return requestPromise;
    }

    // Create promise that will fetch data from cache or API
    requestPromise = (async () => {
      // Try to get data from cache
      const cachedData = await this.cacheProvider.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // If not cached, fetch data from API and cache promise

      // Create promise that will fetch data from API
      const promise = (async () => {
        try {
          this.logger.debug(`Fetching from Ordbøkene API: ${urlString}`);
          const response = await fetch(urlString);

          if (!response.ok) {
            const message = `Error fetching from Ordbøkene API: ${response.statusText} (${response.status})\nURL: ${urlString}`;
            this.logger.error(message);
            throw new Error(message);
          }

          const data = (await response.json()) as T;

          return data;
        } catch (error) {
          this.logger.error(
            `Failed to fetch from Ordbøkene API: ${error.message}\nURL: ${urlString}`,
          );

          try {
            // Delete cache if request failed so that we may try again
            this.cacheProvider.delete(cacheKey);
          } catch (err) {
            this.logger.error(
              `Failed to delete cache for key ${cacheKey}: ${err.message}`,
            );
          }

          throw error;
        }
      })();

      // Cache promise, not data, so that if requests are made in parallel, they
      // will all get the same promise rather than resulting in multiple requests
      // to the API
      this.cacheProvider.set(cacheKey, promise, cacheBucket);

      return promise;
    })();

    this.requestMap.set(cacheKey, requestPromise);

    return requestPromise.finally(() => {
      this.requestMap.delete(cacheKey);
    });
  }

  private getDictParam(dictionary: Dictionary | Dictionary[]): string {
    return Array.isArray(dictionary)
      ? dictionary.map((d) => this.getDictParam(d)).join(',')
      : dictionary === Dictionary.Bokmaalsordboka
        ? 'bm'
        : 'nn';
  }

  private generateCacheKey(url: string): string {
    return `ordboekene_api_${createHash('sha1').update(url).digest('hex')}`;
  }
}
