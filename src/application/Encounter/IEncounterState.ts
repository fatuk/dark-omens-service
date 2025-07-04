import { Encounter } from "types/Encounter";
import { EncounterState } from "./IEncounter";

export interface IEncounterState {
  getState(): EncounterState | null | undefined;
  setState(encounterState: EncounterState | null): void;
  getEncounterById(id: string): Encounter | null;
}
