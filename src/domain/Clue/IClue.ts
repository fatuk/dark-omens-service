import { Clue } from "types/Clue";

export interface IClue {
  draw: () => string | null;
  discard: (id: string) => boolean;
  getState: () => Clue[];
  setState: (ids: string[]) => void;
}
