export type SkillSet = {
  lore: number;
  influence: number;
  observation: number;
  strength: number;
  will: number;
};

export type Skill = keyof SkillSet;
