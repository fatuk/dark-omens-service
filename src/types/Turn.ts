import { GamePhase } from "./GamePhase";

export type Turn = {
  round: number;
  phase: GamePhase;
  leadInvestigatorId: string;
  currentInvestigatorId: string;
};
