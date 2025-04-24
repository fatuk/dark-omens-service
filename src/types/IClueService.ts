import { Clue } from "./Clue";

export interface IClueService {
  draw: () => string | null;
  getAll: () => Clue[];
  discard: (id: string) => boolean;
  restore: (ids: string[]) => void;
}
