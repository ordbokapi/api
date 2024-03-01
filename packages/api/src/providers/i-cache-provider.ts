export enum TTLBucket {
  Short,
  Long,
  Never,
}

export interface ICacheProvider {
  set(key: string, value: any, bucket?: TTLBucket): Promise<void> | void;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void> | void;
}
