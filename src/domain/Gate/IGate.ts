import { Gate } from "types/Gate";

export interface IGate {
  draw: () => string | null;
  discard: (id: string) => boolean;
  getState: () => Gate[];
  setState: (ids: string[]) => void;
}
