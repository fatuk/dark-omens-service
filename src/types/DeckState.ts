import { Card } from "types/Card";

export type DeckState<T extends Card> = {
  drawPile: T[];
  discardPile: T[];
  removedFromGame: T[];
};
