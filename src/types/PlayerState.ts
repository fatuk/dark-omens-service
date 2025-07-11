import { SkillSet } from "./SkillSet";

export type PlayerState = {
  id: string;
  userId: string;
  investigatorId: string;
  turnOrder: number;
  isOnline: boolean;
  health: number;
  maxHealth: number;
  sanity: number;
  maxSanity: number;
  locationId: string;
  assetIds: string[];
  actionsTaken: string[];
  conditionIds: string[];
  clueCount: number;
  focusCount: number;
  resourceCount: number;
  isDefeated: boolean;
  isEliminated: boolean;
  skillSet: SkillSet;
  skillModifiers: SkillSet;
  deathReason?: "injury" | "sanity" | null;
};
