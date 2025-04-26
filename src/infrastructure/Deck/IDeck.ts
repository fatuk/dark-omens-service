import { Card } from "types/Card";
import { DeckManagerState } from "types/DeckManagerState";

export interface IDeck<T extends Card> {
  initialize(cards: T[]): void;
  restoreFromState(state: DeckManagerState): void;
  getState(): DeckManagerState;
  getCardById(id: string): T | null;
  draw(): T | null;
  shuffle(cards: T[]): T[];
  shuffleDrawPile(): void;
  discard(card: T): void;
  removeFromGame(card: T): void;
  drawByType(type: string): T | null;
  peek(count?: number): T[];
  returnToTop(card: T): void;
  returnToBottom(card: T): void;
}
