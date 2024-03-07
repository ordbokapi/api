import 'reflect-metadata';

export const DEV_ONLY_WATERMARK = Symbol('DEV_ONLY_WATERMARK');

/**
 * Decorator to mark a class as only available outside of production. This is
 * useful for classes that are only used for debugging or development purposes.
 */
export function DevOnly(): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(DEV_ONLY_WATERMARK, true, target);
  };
}
