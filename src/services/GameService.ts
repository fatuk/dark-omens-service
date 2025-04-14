import { AllDecksManager } from "./AllDeckManager";
import { DeckManagerState } from "./DeckManager";
import { Asset } from "types/Asset";
import { Spell } from "types/Spell";
import { Condition } from "types/Condition";
import { Card, CardType } from "types/Card";

export type GameState = {
  decks: {
    asset: DeckManagerState;
    spell: DeckManagerState;
    condition: DeckManagerState;
  };
  log: string[];
};

export class GameService {
  private decks: AllDecksManager;
  private log: string[] = [];

  constructor(decks: AllDecksManager) {
    this.decks = decks;
  }

  drawCard(type: CardType): Card | null {
    const card = this.decks.draw(type);
    if (card) this.log.push(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard(type: CardType, card: Card) {
    this.decks[type].discard(card as any);
    this.log.push(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck(type: CardType) {
    this.decks.shuffle(type);
    this.log.push(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      decks: this.decks.getState(),
      log: [...this.log],
    };
  }

  restoreFromState(
    state: GameState,
    dbs: {
      asset: Map<string, Asset>;
      spell: Map<string, Spell>;
      condition: Map<string, Condition>;
    }
  ) {
    this.decks.restoreFromState(state.decks, dbs);
    this.log = state.log;
  }
}
