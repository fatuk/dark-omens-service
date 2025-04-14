import { Card } from "./Card";

export type Skill = "lore" | "influence" | "observation" | "strength" | "sill";

export type EffectContext =
  | "researchEncounters"
  | "combatEncounter"
  | "acquireAssets"
  | "expeditionEncounter"
  | "mysticRuinsEncounter";

export type EffectType =
  | "reroll"
  | "damageReduction"
  | "resultManipulation"
  | "recovery"
  | "reckoning"
  | "gainClue"
  | "skillModification";

export type Effect = {
  type: EffectType;
  skill?: Skill;
  contexts: EffectContext[];
  details: {
    diceResult?: number;
    diceCount?: number;
    diceRoll?: {
      successValues: number[];
      result: Effect[];
    };
    additionalRecovery?: number;
    amount?: number;
    minimum?: number;
    modification?: number;
  };
};

export type Tag =
  | "weapon"
  | "trinket"
  | "item"
  | "magical"
  | "relic"
  | "ally"
  | "service"
  | "teamwork";

export type Asset = Card & {
  cost: number;
  hasEffect: boolean;
  hasAction: boolean;
  hasSkillBonus: boolean;
  hasReroll: boolean;
  hasAdditionalDice: boolean;
  hasResultManipulation: boolean;
  hasDiscardEffect: boolean;
  hasReckoning: boolean;
  effects?: Effect[];
  tags?: Tag[];
};
