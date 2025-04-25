import playersData from "data/players.json";
import { PlayerState } from "types/PlayerState";

export class PlayerRepository {
  private cache: PlayerState[];

  constructor() {
    this.cache = playersData as PlayerState[];
  }

  async getAll(): Promise<PlayerState[]> {
    return this.cache;
  }

  async getById(id: string): Promise<PlayerState | null> {
    return this.cache.find((c) => c.id === id) ?? null;
  }

  async getMap(): Promise<Map<string, PlayerState>> {
    return new Map(this.cache.map((c) => [c.id, c]));
  }
}
