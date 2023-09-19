import fs from 'fs/promises';
import path from 'path';

interface CacheData<T> {
  lastCached: number;
  data: T;
}

export default class LocalCache<T> {
  private readonly filepath: string;

  constructor(filepath: string) {
    this.filepath = path.join(__dirname, filepath);
  }

  async isFresh(expiry: number): Promise<boolean> {
    try {
      const contents = await fs.readFile(this.filepath, 'utf-8');
      const data = JSON.parse(contents) as CacheData<T>;
      return data.lastCached > expiry;
    } catch (error) {
      return false;
    }
  }

  async store(data: T): Promise<void> {
    const cache: CacheData<T> = {
      lastCached: Date.now(),
      data: data,
    };
    await fs.writeFile(this.filepath, JSON.stringify(cache));
  }

  async read(): Promise<T | null> {
    try {
      const contents = await fs.readFile(this.filepath, 'utf-8');
      const data = JSON.parse(contents) as CacheData<T>;
      return data.data;
    } catch (error) {
      return null;
    }
  }
}
