import { IDeck } from "infrastructure/Deck/IDeck";
import { CardMap } from "types/Card";
import { DeckManagerState } from "types/DeckManagerState";

export interface IAllDecks {
  draw<K extends keyof CardMap>(type: K): CardMap[K] | null;
  discard<K extends keyof CardMap>(type: K, card: CardMap[K]): void;
  shuffle<K extends keyof CardMap>(type: K): void;
  getCardById<K extends keyof CardMap>(type: K, id: string): CardMap[K] | null;
  getState(): { [K in keyof CardMap]: DeckManagerState };
  restoreFromState(
    state: { [K in keyof CardMap]: DeckManagerState },
    dbs: { [K in keyof CardMap]: Map<string, CardMap[K]> }
  ): void;
  getManager<K extends keyof CardMap>(type: K): IDeck<CardMap[K]>;
}
