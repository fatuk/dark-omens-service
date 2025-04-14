import { Condition } from "types/Condition";
import { Asset } from "types/Asset";
import { Spell } from "types/Spell";
import { DeckManager } from "./DeckManager";
import { CardMap } from "types/Card";
import { DeckManagerState } from "types/DeckManagerState";

export class AllDecksManager {
  private decks: {
    asset: DeckManager<Asset>;
    spell: DeckManager<Spell>;
    condition: DeckManager<Condition>;
  };

  constructor(params: {
    asset: { deck: Asset[]; db: Map<string, Asset> };
    spell: { deck: Spell[]; db: Map<string, Spell> };
    condition: { deck: Condition[]; db: Map<string, Condition> };
  }) {
    this.decks = {
      asset: new DeckManager(params.asset.db),
      spell: new DeckManager(params.spell.db),
      condition: new DeckManager(params.condition.db),
    };

    this.decks.asset.initialize(params.asset.deck);
    this.decks.spell.initialize(params.spell.deck);
    this.decks.condition.initialize(params.condition.deck);
  }

  draw<K extends keyof CardMap>(type: K): CardMap[K] | null {
    const deckManager = this.decks[type] as DeckManager<CardMap[K]>;
    return deckManager.draw();
  }

  discard<K extends keyof CardMap>(type: K, card: CardMap[K]): void {
    const deckManager = this.decks[type] as DeckManager<CardMap[K]>;
    deckManager.discard(card);
  }

  shuffle<K extends keyof CardMap>(type: K): void {
    const deckManager = this.decks[type] as DeckManager<CardMap[K]>;
    deckManager.shuffleDrawPile();
  }

  getState(): {
    asset: DeckManagerState;
    spell: DeckManagerState;
    condition: DeckManagerState;
  } {
    return {
      asset: this.decks.asset.getState(),
      spell: this.decks.spell.getState(),
      condition: this.decks.condition.getState(),
    };
  }

  getCardById<K extends keyof CardMap>(type: K, id: string): CardMap[K] | null {
    const deckManager = this.decks[type] as DeckManager<CardMap[K]>;
    return deckManager.getCardById(id);
  }

  restoreFromState(
    state: {
      asset: DeckManagerState;
      spell: DeckManagerState;
      condition: DeckManagerState;
    },
    dbs: {
      asset: Map<string, Asset>;
      spell: Map<string, Spell>;
      condition: Map<string, Condition>;
    }
  ) {
    this.decks = {
      asset: new DeckManager(dbs.asset),
      spell: new DeckManager(dbs.spell),
      condition: new DeckManager(dbs.condition),
    };

    this.decks.asset.restoreFromState(state.asset);
    this.decks.spell.restoreFromState(state.spell);
    this.decks.condition.restoreFromState(state.condition);
  }
}
