import { PlayerState } from "./PlayerState";

export interface PlayerStateService {
  getAll(): PlayerState[];
  getById(id: string): PlayerState | undefined;
  update(player: PlayerState): void;
  clear(): void;
}
