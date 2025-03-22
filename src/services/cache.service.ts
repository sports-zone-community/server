import { Cache, CacheEntry } from '../utils/interfaces/cache';

export class CacheService {
  private static instance: CacheService;
  private cache: Cache = {};
  private readonly CACHE_DURATION = 3600000; // 1 hour

  private constructor() {}

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public set<T>(key: string, data: T): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
    };
  }

  public get<T>(key: string): T | null {
    const entry: CacheEntry<T> | undefined = this.cache[key];
    if (!entry) return null;

    const isValid: boolean = Date.now() - entry.timestamp < this.CACHE_DURATION;
    if (!isValid) {
      delete this.cache[key];
      return null;
    }

    return entry.data as T;
  }

  public clear(): void {
    this.cache = {};
  }
} 