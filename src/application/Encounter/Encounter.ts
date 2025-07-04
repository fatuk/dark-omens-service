import { IDeck } from "infrastructure/Deck";
import { ILog } from "infrastructure/Log";
import { IEncounterState } from "./IEncounterState";
import { EncounterState, IEncounter } from "./IEncounter";
import { Encounter as EncounterCard, EncounterEffect } from "types/Encounter";

export class Encounter implements IEncounter {
  constructor(
    private readonly deck: IDeck<EncounterCard>,
    private readonly state: IEncounterState,
    private readonly logger: ILog
  ) {}

  start(playerId: string, locationType: EncounterCard["locationType"]) {
    const card = this.deck.drawByField("locationType", locationType);

    if (!card || this.state.getState()) return null;

    this.state.setState({ playerId, encounterId: card.id });
    this.logger.add("encounter.start", { playerId, encounterId: card.id });

    return card;
  }

  getState(): {
    playerId: string;
    encounterId: string;
  } | null {
    const pending = this.state.getState();
    if (!pending) return null;

    return {
      playerId: pending.playerId,
      encounterId: pending.encounterId,
    };
  }

  setState(pending: EncounterState): void {
    this.state.setState({ ...pending });
  }

  getEncounter() {
    const pending = this.state.getState();
    if (!pending) return null;

    const card = this.state.getEncounterById(pending.encounterId);
    if (!card) return null;

    this.logger.add("encounter.getEncounter", {
      playerId: pending.playerId,
      encounterId: pending.encounterId,
    });

    return card;
  }

  resolve(success: boolean): EncounterEffect | null {
    const pending = this.state.getState();

    if (!pending) return null;

    const card = this.state.getEncounterById(pending.encounterId);

    if (!card) return null;

    this.logger.add("encounter.resolve", {
      playerId: pending.playerId,
      encounterId: pending.encounterId,
      success,
    });

    const effect = success ? card.successEffects : card.failureEffects;

    return effect ?? null;
  }
}
