import { Clue } from "types/Clue";
import { DeckManager } from "services/DeckManager";
import { ILogService } from "types/ILogService";
import { ClueStateService } from "types/ClueStateService";
import { IClueService } from "types/IClueService";

export class ClueService implements IClueService {
  constructor(
    private readonly deck: DeckManager<Clue>,
    private readonly state: ClueStateService,
    private readonly logger: ILogService
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

  getAll(): Clue[] {
    return this.state
      .getClueIds()
      .map((id) => this.state.getClueById(id))
      .filter((c): c is Clue => Boolean(c));
  }

  restore(ids: string[]): void {
    this.state.setClueIds([...ids]);
  }
}
