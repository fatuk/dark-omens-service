import { Asset } from "./Asset";
import { Clue } from "./Clue";
import { Condition } from "./Condition";
import { Encounter } from "./Encounter";
import { Gate } from "./Gate";
import { Spell } from "./Spell";

export type CardMap = {
  asset: Asset;
  spell: Spell;
  condition: Condition;
  gate: Gate;
  clue: Clue;
  encounter: Encounter;
};

export type CardType = keyof CardMap;

export type Card = {
  id: string;
  name: string;
  text?: string;
  type: CardType;
  gameSet: string;
};
