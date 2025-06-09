import { Clue as ClueCard } from "types/Clue";
import type { IClue } from "./IClue";
import type { IClueState } from "./IClueState";
import { IDeck } from "infrastructure/Deck";
import { ILog } from "infrastructure/Log";
import { resolveCards } from "helpers/resolveCards";

export class Clue implements IClue {
  constructor(
    private readonly deck: IDeck<ClueCard>,
    private readonly state: IClueState,
    private readonly logger: ILog
  ) {}

  draw(): string | null {
    const clue = this.deck.draw();

    if (!clue) return null;

    const ids = [...this.state.getClueIds(), clue.id];
    this.state.setClueIds(ids);
    this.logger.add("clue.draw", {
      clueId: clue.id,
      clueLocation: clue.location,
    });

    return clue.id;
  }

  discard(id: string): boolean {
    const ids = [...this.state.getClueIds()];
    const idx = ids.indexOf(id);
    const clue = this.state.getClueById(id);

    if (idx === -1 || !clue) return false;

    ids.splice(idx, 1);
    this.state.setClueIds(ids);
    this.deck.discard(clue);
    this.logger.add("clue.discard", {
      clueId: clue.id,
      clueLocation: clue.location,
    });

    return true;
  }

  getState(): ClueCard[] {
    return resolveCards(this.state.getClueIds(), (id) =>
      this.state.getClueById(id)
    );
  }

  setState(ids: string[]): void {
    this.state.setClueIds([...ids]);
  }
}
