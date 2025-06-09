import { Clue } from "types/Clue";

export interface IClueState {
  getClueIds(): string[];
  setClueIds(ids: string[]): void;
  getClueById(id: string): Clue | undefined;
}
