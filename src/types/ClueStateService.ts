import { Clue } from "./Clue";

export interface ClueStateService {
  getClueIds(): string[];
  setClueIds(ids: string[]): void;
  getClueById(id: string): Clue | undefined;
}
