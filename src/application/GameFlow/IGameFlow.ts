import { Turn } from "types/Turn";

export interface IGameFlow {
  nextPhase(): boolean;
  nextInvestigator(): boolean;
  passLeadInvestigator(playerId: string): boolean;
  getTurn(): Turn;
  setTurn(turn: Turn): boolean;
}
