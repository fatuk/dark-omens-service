import { Card } from "./Card";
import { GateColor } from "./GateColor";

export type Gate = Card & {
  location: string;
  color: GateColor;
};
