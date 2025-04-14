import { Card, CardType } from "./Card";

export type GameAction =
  | { type: "DRAW_CARD"; cardType: CardType }
  | { type: "DISCARD_CARD"; cardType: CardType; card: Card }
  | { type: "SHUFFLE_DECK"; cardType: CardType };
