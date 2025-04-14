import { Card } from "types/Card";
import { DeckState } from "types/DeckState";

export type DeckManagerState = {
  drawPile: string[];
  discardPile: string[];
  removedFromGame: string[];
};

export class DeckManager<T extends Card> {
  private deck: DeckState<T>;
  private cardDb: Map<string, T>;

  constructor(cardDb: Map<string, T>) {
    this.cardDb = cardDb;
    this.deck = { drawPile: [], discardPile: [], removedFromGame: [] };
  }

  initialize(cards: T[]) {
    this.deck = {
      drawPile: this.shuffle(cards),
      discardPile: [],
      removedFromGame: [],
    };
  }

  restoreFromState(state: DeckManagerState) {
    const get = (id: string) => {
      const card = this.cardDb.get(id);
      if (!card) throw new Error(`Card not found: ${id}`);
      return card;
    };

    this.deck = {
      drawPile: state.drawPile.map(get),
      discardPile: state.discardPile.map(get),
      removedFromGame: state.removedFromGame.map(get),
    };
  }

  getState(): DeckManagerState {
    return {
      drawPile: this.deck.drawPile.map((card) => card.id),
      discardPile: this.deck.discardPile.map((card) => card.id),
      removedFromGame: this.deck.removedFromGame.map((card) => card.id),
    };
  }

  draw(): T | null {
    if (!this.deck.drawPile.length) {
      if (!this.deck.discardPile.length) return null;
      this.deck.drawPile = this.shuffle(this.deck.discardPile);
      this.deck.discardPile = [];
    }
    return this.deck.drawPile.pop() ?? null;
  }

  shuffle(cards: T[]): T[] {
    return [...cards].sort(() => Math.random() - 0.5);
  }

  shuffleDrawPile() {
    this.deck.drawPile = this.shuffle(this.deck.drawPile);
  }

  discard(card: T) {
    this.deck.discardPile.push(card);
  }

  removeFromGame(card: T) {
    this.deck.removedFromGame.push(card);
  }

  drawByType(type: string): T | null {
    const index = this.deck.drawPile.findIndex((c) => c.type === type);
    if (index === -1) return null;
    const [card] = this.deck.drawPile.splice(index, 1);
    return card;
  }

  peek(count = 1): T[] {
    return this.deck.drawPile.slice(-count);
  }

  returnToTop(card: T) {
    this.deck.drawPile.push(card);
  }

  returnToBottom(card: T) {
    this.deck.drawPile.unshift(card);
  }
}
