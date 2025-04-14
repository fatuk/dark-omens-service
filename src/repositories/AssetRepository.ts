import { Asset } from "types/Asset";

import assetData from "data/assets.json";

export class AssetRepository {
  private cache: Asset[];

  constructor() {
    this.cache = assetData as Asset[];
  }

  async getAll(): Promise<Asset[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Asset | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Asset>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
