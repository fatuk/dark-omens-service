import { Clue } from "./Clue";

export interface ClueState {
  getClueIds(): string[];
  setClueIds(ids: string[]): void;
  getClueById(id: string): Clue | undefined;
}
