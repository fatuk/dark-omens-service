import { Clue } from "types/Clue";

export interface IClue {
  draw: () => string | null;
  getAll: () => Clue[];
  discard: (id: string) => boolean;
  restore: (ids: string[]) => void;
}
