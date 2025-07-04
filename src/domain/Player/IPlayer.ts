import { PlayerState } from "types/PlayerState";
import { Skill } from "types/SkillSet";

export interface IPlayer {
  canTakeAction(playerId: string, actionType: string): boolean;
  recordAction(playerId: string, actionType: string): void;
  resetActions(): void;
  move(playerId: string, locationId: string): boolean;
  healHealth(playerId: string, amount: number): boolean;
  loseHealth(playerId: string, amount: number): boolean;
  healSanity(playerId: string, amount: number): boolean;
  loseSanity(playerId: string, amount: number): boolean;
  initialize(initialPlayers: PlayerState[]): void;
  getById(id: string): PlayerState | undefined;
  getState(): PlayerState[];
  setState(player: PlayerState[]): void;
  modifySkill(playerId: string, skill: Skill, value: number): boolean;
}
