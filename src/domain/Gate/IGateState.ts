import { Gate } from "types/Gate";

export interface IGateState {
  getGateIds(): string[];
  setGateIds(ids: string[]): void;
  getGateById(id: string): Gate | undefined;
}
