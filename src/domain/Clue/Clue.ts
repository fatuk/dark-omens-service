import { Clue as ClueCard } from "types/Clue";
import { ClueStateService } from "types/ClueStateService";
import { IClue } from "./IClue";
import { IDeck } from "infrastructure/Deck";
import { ILog } from "infrastructure/Log";

export class Clue implements IClue {
  constructor(
    private readonly deck: IDeck<ClueCard>,
    private readonly state: ClueStateService,
    private readonly logger: ILog
  ) {}

  draw(): string | null {
    const clue = this.deck.draw();
    if (!clue) return null;
    const ids = [...this.state.getClueIds(), clue.id];
    this.state.setClueIds(ids);
    this.logger.add(`Выложена улика: ${clue.name}`);
    return clue.id;
  }

  discard(id: string): boolean {
    const ids = [...this.state.getClueIds()];
    const idx = ids.indexOf(id);
    if (idx === -1) return false;
    ids.splice(idx, 1);
    this.state.setClueIds(ids);
    this.logger.add(`Улика ${id} сброшена`);
    return true;
  }

  getAll(): ClueCard[] {
    return this.state
      .getClueIds()
      .map((id) => this.state.getClueById(id))
      .filter((c): c is ClueCard => Boolean(c));
  }

  restore(ids: string[]): void {
    this.state.setClueIds([...ids]);
  }
}
