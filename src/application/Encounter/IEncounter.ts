import { Encounter, EncounterEffect } from "types/Encounter";

export type EncounterState = {
  playerId: string;
  encounterId: string;
};

export interface IEncounter {
  start(
    playerId: string,
    locationType: Encounter["locationType"]
  ): Encounter | null;
  setState(pending: EncounterState | null): void;
  getState(): EncounterState | null;
  getEncounter(): Encounter | null;
  resolve(success: boolean): EncounterEffect | null;
}
