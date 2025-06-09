import { PlayerState } from "types/PlayerState";

export interface IPlayerState {
  getAll(): PlayerState[];
  getById(id: string): PlayerState | undefined;
  update(player: PlayerState): void;
  clear(): void;
}
