import { Spell } from "types/Spell";

import spellData from "data/spells.json";

export class SpellRepository {
  private cache: Spell[];

  constructor() {
    this.cache = spellData as Spell[];
  }

  async getAll(): Promise<Spell[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Spell | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Spell>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
