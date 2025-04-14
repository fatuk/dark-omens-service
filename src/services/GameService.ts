import { AllDecksManager } from "./AllDeckManager";
import { DeckManagerState } from "./DeckManager";
import { Asset } from "types/Asset";
import { Spell } from "types/Spell";
import { Condition } from "types/Condition";
import { CardMap, CardType } from "types/Card";
import { GameAction } from "types/GameAction";

export type GameState = {
  decks: { [K in keyof CardMap]: DeckManagerState };
  market: string[];
  log: string[];
};

export class GameService {
  private decks: AllDecksManager;
  private log: string[] = [];
  private market: Asset[] = [];

  constructor(decks: AllDecksManager) {
    this.decks = decks;
    this.replenishMarket();
  }

  drawCard<T extends CardType>(type: T): CardMap[T] | null {
    const card = this.decks.draw(type);
    if (card) this.log.push(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard<T extends CardType>(type: T, card: CardMap[T]): void {
    this.decks.discard(type, card);
    this.log.push(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck<T extends CardType>(type: T): void {
    this.decks.shuffle(type);
    this.log.push(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      decks: this.decks.getState(),
      market: this.market.map((c) => c.id),
      log: [...this.log],
    };
  }

  getMarket(): Asset[] {
    return [...this.market];
  }

  replenishMarket() {
    while (this.market.length < 4) {
      const card = this.decks.draw("asset");

      if (!card) break;
      this.market.push(card);
      this.log.push(`Добавлена карта в маркет: ${card.name}`);
    }
  }

  buyFromMarket(cardId: string): Asset | null {
    const index = this.market.findIndex((c) => c.id === cardId);
    if (index === -1) return null;
    const [card] = this.market.splice(index, 1);
    this.log.push(`Куплена карта: ${card.name}`);
    this.replenishMarket();
    return card;
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
    this.market = state.market.map((id) => dbs.asset.get(id)!);
    this.log = state.log;
  }

  apply(action: GameAction) {
    switch (action.type) {
      case "DRAW_CARD":
        return this.drawCard(action.cardType);
      case "DISCARD_CARD":
        return this.discardCard(action.cardType, action.card);
      case "SHUFFLE_DECK":
        return this.shuffleDeck(action.cardType);
    }
  }

  getLog(): string[] {
    return [...this.log];
  }
}
