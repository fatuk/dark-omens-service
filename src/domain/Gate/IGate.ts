import { Gate } from "types/Gate";

export interface IGate {
  draw: () => string | null;
  getAll: () => Gate[];
  discard: (id: string) => boolean;
  restore: (ids: string[]) => void;
}
