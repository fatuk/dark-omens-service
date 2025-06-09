import { Turn } from "types/Turn";

export interface IGameFlow {
  nextPhase(): void;
  nextInvestigator(): void;
  passLeadInvestigator(playerId: string): void;
  getTurn(): Turn;
  setTurn(turn: Turn): void;
}
