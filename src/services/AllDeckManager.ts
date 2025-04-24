import { DeckManager } from "./DeckManager";
import { CardMap } from "types/Card";
import { DeckManagerState } from "types/DeckManagerState";

type Decks = { [K in keyof CardMap]: DeckManager<CardMap[K]> };
type InitParams = {
  [K in keyof CardMap]: {
    deck: CardMap[K][];
    db: Map<string, CardMap[K]>;
  };
};

export class AllDecksManager {
  private decks: Decks;

  constructor(params: InitParams) {
    const entries = (Object.keys(params) as Array<keyof CardMap>).map((k) => {
      const { deck, db } = params[k];
      const mgr = new DeckManager<CardMap[typeof k]>(db);
      mgr.initialize(deck);
      return [k, mgr] as const;
    });

    this.decks = Object.fromEntries(entries) as Decks;
  }

  draw<K extends keyof CardMap>(type: K): CardMap[K] | null {
    return this.decks[type].draw();
  }

  discard<K extends keyof CardMap>(type: K, card: CardMap[K]): void {
    this.decks[type].discard(card);
  }

  shuffle<K extends keyof CardMap>(type: K): void {
    this.decks[type].shuffleDrawPile();
  }

  getCardById<K extends keyof CardMap>(type: K, id: string): CardMap[K] | null {
    return this.decks[type].getCardById(id);
  }

  getState(): { [K in keyof CardMap]: DeckManagerState } {
    const stateEntries = (Object.keys(this.decks) as Array<keyof CardMap>).map(
      (k) => [k, this.decks[k].getState()] as const
    );
    return Object.fromEntries(stateEntries) as {
      [K in keyof CardMap]: DeckManagerState;
    };
  }

  restoreFromState(
    state: { [K in keyof CardMap]: DeckManagerState },
    dbs: { [K in keyof CardMap]: Map<string, CardMap[K]> }
  ) {
    const entries = (Object.keys(dbs) as Array<keyof CardMap>).map((k) => {
      const mgr = new DeckManager<CardMap[typeof k]>(dbs[k]);
      mgr.restoreFromState(state[k]);
      return [k, mgr] as const;
    });
    this.decks = Object.fromEntries(entries) as Decks;
  }

  getManager<K extends keyof CardMap>(type: K): DeckManager<CardMap[K]> {
    return this.decks[type];
  }
}
