import { Logger } from '@nestjs/common';
import { InMemoryCacheProvider } from './in-memory-cache.provider';
import { TTLBucket } from './i-cache-provider';

describe('InMemoryCacheProvider', () => {
  let cacheProvider: InMemoryCacheProvider;
  // Used to simulate the current time.
  const startTime = new Date(2025, 0, 1, 0, 0, 0).getTime();

  beforeAll(() => {
    // Silence the logger by overriding its methods.
    jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(startTime);
    cacheProvider = new InMemoryCacheProvider();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should return null when a key is not found', async () => {
    const result = await cacheProvider.get('nonExistentKey');
    expect(result).toBeNull();
  });

  describe('Non-expiring keys (TTLBucket.Never)', () => {
    test('should cache and retrieve a non-expiring key', async () => {
      cacheProvider.set('nonExpiringKey', 'nonExpiringValue', TTLBucket.Never);
      let result = await cacheProvider.get('nonExpiringKey');
      expect(result).toEqual('nonExpiringValue');

      // Advance time by 10 minutes - the key should still be retrievable.
      await jest.advanceTimersByTimeAsync(10 * 60 * 1000);
      result = await cacheProvider.get('nonExpiringKey');
      expect(result).toEqual('nonExpiringValue');
    });
  });

  describe('TTL keys with TTLBucket.Short', () => {
    // For TTLBucket.Short, this implementation sets:
    //   min TTL = 1 * 60 seconds (60 sec) and max TTL = 60 * 60 seconds (3600 sec).
    test('should cache and retrieve a TTL key and extend its TTL on get', async () => {
      cacheProvider.set('ttlKey', 'ttlValue', TTLBucket.Short);

      // Immediately get - the entry is found.
      let result = await cacheProvider.get('ttlKey');
      expect(result).toEqual('ttlValue');

      // Advance time by 30 seconds, well within the initial 60-sec TTL.
      await jest.advanceTimersByTimeAsync(30 * 1000);
      result = await cacheProvider.get('ttlKey');
      expect(result).toEqual('ttlValue');
      // Note: Each get extends the TTL to "now + 60 sec" (but never past the
      // absolute expiry of t0 + 3600 sec).

      // Advance time to nearly the maximum allowed expiry.
      // (Imagine we are nearly at startTime + 3600 seconds.)
      jest.setSystemTime(startTime + 3599 * 1000);
      result = await cacheProvider.get('ttlKey');
      expect(result).toEqual('ttlValue');

      // Now set the time beyond the maximum TTL boundary.
      jest.setSystemTime(startTime + 3601 * 1000);
      result = await cacheProvider.get('ttlKey');
      expect(result).toBeNull();
    });

    test('should return null if a TTL key expires in the LRUCache (without a get extension)', async () => {
      cacheProvider.set('ttlNoAccess', 'valueNoAccess', TTLBucket.Short);
      // If we do not call get within the initial 60 seconds (min TTL), the key
      // should be removed by lru-cache.
      jest.setSystemTime(startTime + 61 * 1000);
      await jest.advanceTimersByTimeAsync(0);
      await new Promise((resolve) =>
        jest.requireActual('timers').setImmediate(resolve),
      );
      const result = await cacheProvider.get('ttlNoAccess');
      expect(result).toBeNull();
    });
  });

  describe('TTL keys with TTLBucket.Long', () => {
    // For TTLBucket.Long, our implementation sets:
    //   min TTL = 30 * 60 seconds (1800 sec) and max TTL = 4 * 60 * 60 seconds (14400 sec).
    test('should cache and retrieve a Long TTL key and extend its TTL on get', async () => {
      cacheProvider.set('longTTLKey', 'longTTLValue', TTLBucket.Long);

      // Immediately get the value.
      let result = await cacheProvider.get('longTTLKey');
      expect(result).toEqual('longTTLValue');

      // Advance a short amount of time (e.g. 10 seconds) and the key should
      // still exist.
      await jest.advanceTimersByTimeAsync(10 * 1000);
      result = await cacheProvider.get('longTTLKey');
      expect(result).toEqual('longTTLValue');

      // Advance time to just before the maximum expiry (t0 + 14400 sec - 1 sec):
      jest.setSystemTime(startTime + (14400 - 1) * 1000);
      result = await cacheProvider.get('longTTLKey');
      expect(result).toEqual('longTTLValue');

      // Advance beyond the maximum TTL.
      jest.setSystemTime(startTime + 14400 * 1000 + 1);
      result = await cacheProvider.get('longTTLKey');
      expect(result).toBeNull();
    });
  });

  describe('Delete operation', () => {
    test('should delete a TTL key from the cache', async () => {
      cacheProvider.set('keyToDelete', 'deleteValue', TTLBucket.Short);
      let result = await cacheProvider.get('keyToDelete');
      expect(result).toEqual('deleteValue');

      // Delete the key.
      cacheProvider.delete('keyToDelete');
      result = await cacheProvider.get('keyToDelete');
      expect(result).toBeNull();
    });

    test('should delete a non-expiring key from the cache', async () => {
      cacheProvider.set('nonExpDelete', 'nonExpValue', TTLBucket.Never);
      let result = await cacheProvider.get('nonExpDelete');
      expect(result).toEqual('nonExpValue');

      // Delete the non-expiring key.
      cacheProvider.delete('nonExpDelete');
      result = await cacheProvider.get('nonExpDelete');
      expect(result).toBeNull();
    });
  });

  describe('Overwriting existing keys', () => {
    test('should override an existing key when set is called again', async () => {
      // First, set a key with a TTL.
      cacheProvider.set('duplicateKey', 'initialValue', TTLBucket.Short);
      let result = await cacheProvider.get('duplicateKey');
      expect(result).toEqual('initialValue');

      // Now, override it with a new value (using a different TTL bucket,
      // e.g. non-expiring).
      cacheProvider.set('duplicateKey', 'newValue', TTLBucket.Never);
      result = await cacheProvider.get('duplicateKey');
      expect(result).toEqual('newValue');
    });
  });
});
