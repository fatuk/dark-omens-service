import { Clue } from "types/Clue";

import clueData from "data/clues.json";

export class ClueRepository {
  private cache: Clue[];

  constructor() {
    this.cache = clueData as Clue[];
  }

  async getAll(): Promise<Clue[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Clue | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Clue>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
