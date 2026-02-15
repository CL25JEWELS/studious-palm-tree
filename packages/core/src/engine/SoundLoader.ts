/**
 * SoundLoader - Handles loading sounds from local storage and cloud sources
 * Supports offline caching for improved performance
 */

import type { Sample, SoundPack, UUID } from '../models/index.js';

export interface LoaderConfig {
  cacheEnabled: boolean;
  cloudEndpoint?: string;
  maxCacheSize: number; // in bytes
}

export class SoundLoader {
  private config: LoaderConfig;
  private cache: Map<string, ArrayBuffer> = new Map();
  private cacheSize = 0;

  constructor(config?: Partial<LoaderConfig>) {
    this.config = {
      cacheEnabled: true,
      maxCacheSize: 100 * 1024 * 1024, // 100MB default
      ...config,
    };
  }

  /**
   * Load a sample from URL or cache
   */
  async loadSample(sample: Sample): Promise<ArrayBuffer> {
    // Check cache first
    if (this.config.cacheEnabled) {
      const cached = this.cache.get(sample.url);
      if (cached) {
        return cached;
      }

      // Try IndexedDB cache
      const cachedFromDB = await this.loadFromIndexedDB(sample.id);
      if (cachedFromDB) {
        return cachedFromDB;
      }
    }

    // Fetch from network
    const arrayBuffer = await this.fetchSample(sample.url);

    // Cache if enabled
    if (this.config.cacheEnabled) {
      await this.cacheArrayBuffer(sample.id, sample.url, arrayBuffer);
    }

    return arrayBuffer;
  }

  /**
   * Load a complete sound pack
   */
  async loadSoundPack(pack: SoundPack): Promise<void> {
    const loadPromises = pack.samples.map(async (sample) => {
      try {
        await this.loadSample(sample);
      } catch (error) {
        console.error(`Failed to load sample ${sample.name}:`, error);
        throw error;
      }
    });

    await Promise.all(loadPromises);
  }

  /**
   * Fetch sample from URL
   */
  private async fetchSample(url: string): Promise<ArrayBuffer> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      console.error(`Failed to fetch sample from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Cache array buffer in memory and IndexedDB
   */
  private async cacheArrayBuffer(
    id: UUID,
    url: string,
    buffer: ArrayBuffer
  ): Promise<void> {
    // Memory cache
    if (this.cacheSize + buffer.byteLength <= this.config.maxCacheSize) {
      this.cache.set(url, buffer);
      this.cacheSize += buffer.byteLength;
    }

    // IndexedDB cache for persistence
    try {
      await this.saveToIndexedDB(id, buffer);
    } catch (error) {
      console.warn('Failed to cache to IndexedDB:', error);
    }
  }

  /**
   * Load from IndexedDB
   */
  private async loadFromIndexedDB(id: UUID): Promise<ArrayBuffer | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('LoopPadCache', 1);

      request.onerror = () => resolve(null);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('samples')) {
          db.createObjectStore('samples');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['samples'], 'readonly');
        const store = transaction.objectStore('samples');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          resolve(getRequest.result as ArrayBuffer | null);
        };

        getRequest.onerror = () => resolve(null);
      };
    });
  }

  /**
   * Save to IndexedDB
   */
  private async saveToIndexedDB(
    id: UUID,
    buffer: ArrayBuffer
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('LoopPadCache', 1);

      request.onerror = () => reject(request.error);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('samples')) {
          db.createObjectStore('samples');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['samples'], 'readwrite');
        const store = transaction.objectStore('samples');
        const putRequest = store.put(buffer, id);

        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheSize = 0;
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cacheSize;
  }

  /**
   * Preload samples for offline use
   */
  async preloadForOffline(samples: Sample[]): Promise<void> {
    const loadPromises = samples.map((sample) => this.loadSample(sample));
    await Promise.all(loadPromises);
  }
}
