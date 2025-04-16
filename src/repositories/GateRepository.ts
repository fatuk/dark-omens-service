import { Gate } from "types/Gate";

import gateData from "data/gates.json";

export class GateRepository {
  private cache: Gate[];

  constructor() {
    this.cache = gateData as Gate[];
  }

  async getAll(): Promise<Gate[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Gate | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Gate>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
