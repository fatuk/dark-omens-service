import { Gate as GateCard } from "types/Gate";
import { GateStateService } from "types/GateStateService";
import { IGate } from "./IGate";
import { IDeck } from "infrastructure/Deck";
import { ILog } from "infrastructure/Log";
import { resolveCards } from "helpers/resolveCards";

export class Gate implements IGate {
  constructor(
    private readonly deck: IDeck<GateCard>,
    private readonly state: GateStateService,
    private readonly logger: ILog
  ) {}

  draw(): string | null {
    const gate = this.deck.draw();

    if (!gate) return null;

    const ids = [...this.state.getGateIds(), gate.id];

    this.state.setGateIds(ids);
    this.logger.add("gate.draw", {
      gateId: gate.id,
      gateLocation: gate.location,
      gateColor: gate.color,
    });

    return gate.id;
  }

  discard(id: string): boolean {
    const ids = [...this.state.getGateIds()];
    const idx = ids.indexOf(id);

    if (idx === -1) return false;

    const gate = this.state.getGateById(id);

    if (!gate) return false;

    ids.splice(idx, 1);
    this.state.setGateIds(ids);
    this.deck.discard(gate);
    this.logger.add("gate.discard", {
      gateId: gate.id,
      gateLocation: gate.location,
      gateColor: gate.color,
    });

    return true;
  }

  getAll(): GateCard[] {
    return resolveCards(this.state.getGateIds(), (id) =>
      this.state.getGateById(id)
    );
  }

  restore(ids: string[]): void {
    this.state.setGateIds([...ids]);
  }
}
