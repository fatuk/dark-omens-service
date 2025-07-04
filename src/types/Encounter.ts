import { Tag } from "./Asset";
import { Card } from "./Card";
import { Skill } from "./SkillSet";

export type Encounter = Card & {
  locationType: "city" | "wilderness" | "sea";
  test?: {
    skill: Skill;
    modifier: number;
  };
  successEffects?: EncounterEffect;
  failureEffects?: EncounterEffect;
};

export type EncounterEffect = {
  type: "oneOf" | "anyOf";
  effects: Effect[];
};

export type Effect =
  | { type: "takeAssetFromReserve"; assetTag: Tag }
  | { type: "takeRandomAsset" }
  | { type: "placeClue"; count: number }
  | { type: "improveSkill"; skill: Skill; amount: number }
  | { type: "takeSpell" }
  | { type: "takeArtifact" }
  | { type: "moveToAdjacentLocation" }
  | { type: "loseHealth"; amount: number }
  | { type: "loseSanity"; amount: number }
  | { type: "healHealth"; amount: number }
  | { type: "healSanity"; amount: number }
  | { type: "addCondition"; conditionType: string };
