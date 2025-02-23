export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}
  
export interface Cache {
    [key: string]: CacheEntry<any>;
}