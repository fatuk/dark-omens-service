import { Condition } from "types/Condition";

import conditionData from "data/conditions.json";

export class ConditionRepository {
  private cache: Condition[];

  constructor() {
    this.cache = conditionData as Condition[];
  }

  async getAll(): Promise<Condition[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Condition | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Condition>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
