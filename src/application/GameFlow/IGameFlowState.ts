import { PlayerState } from "types/PlayerState";
import { Turn } from "types/Turn";

export interface IGameFlowState {
  getTurn(): Turn;
  setPhase(phase: Turn["phase"]): void;
  setCurrentInvestigatorId(id: string): void;
  setLeadInvestigatorId(id: string): void;
  setRound(round: number): void;
  getPlayers(): PlayerState[];
}
