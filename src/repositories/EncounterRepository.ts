import encounterData from "data/encounters.json";
import { Encounter } from "types/Encounter";

export class EncounterRepository {
  private cache: Encounter[];

  constructor() {
    this.cache = encounterData as Encounter[];
  }

  async getAll(): Promise<Encounter[]> {
    return this.cache;
  }

  async getById(id: string): Promise<Encounter | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, Encounter>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
