import { Gate } from "./Gate";

export interface GateStateService {
  getGateIds(): string[];
  setGateIds(ids: string[]): void;
  getGateById(id: string): Gate | undefined;
}
