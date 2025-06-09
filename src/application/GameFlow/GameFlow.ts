import { ILog } from "infrastructure/Log";
import { IGameFlow } from "./IGameFlow";
import { Turn } from "types/Turn";
import { IGameFlowState } from "./IGameFlowState";

export class GameFlow implements IGameFlow {
  constructor(
    private readonly state: IGameFlowState,
    private readonly logger: ILog
  ) {}

  nextPhase(): void {
    const turn = this.state.getTurn();

    switch (turn.phase) {
      case "Action":
        this.state.setPhase("Encounter");
        this.state.setCurrentInvestigatorId(turn.leadInvestigatorId);
        this.logger.add("Фаза: встречи");
        break;
      case "Encounter":
        this.state.setPhase("Mythos");
        this.state.setCurrentInvestigatorId(turn.leadInvestigatorId);
        this.logger.add("Фаза: мифов");
        break;
      case "Mythos":
        const newRound = turn.round + 1;
        this.state.setRound(newRound);
        const nextLead = this.getNextPlayerId(turn.leadInvestigatorId);
        this.state.setLeadInvestigatorId(nextLead);
        this.state.setCurrentInvestigatorId(nextLead);
        this.logger.add(`Раунд ${newRound}`);
        break;
    }
  }

  nextInvestigator(): void {
    const turn = this.state.getTurn();
    const players = this.state.getPlayers();
    const idx = players.findIndex((p) => p.id === turn.currentInvestigatorId);
    const next = players[(idx + 1) % players.length];
    this.state.setCurrentInvestigatorId(next.id);
    this.logger.add("gameFlow.nextInvestigator", {
      currentInvestigatorId: turn.currentInvestigatorId,
      nextInvestigatorId: next.id,
    });
  }

  passLeadInvestigator(playerId: string): void {
    this.state.setLeadInvestigatorId(playerId);
    this.logger.add("gameFlow.passLeadInvestigator", {
      playerId,
      leadInvestigatorId: this.state.getTurn().leadInvestigatorId,
    });
  }

  getTurn(): Turn {
    return this.state.getTurn();
  }

  setTurn(turn: Turn): void {
    this.state.setPhase(turn.phase);
    this.state.setRound(turn.round);
    this.state.setLeadInvestigatorId(turn.leadInvestigatorId);
    this.state.setCurrentInvestigatorId(turn.currentInvestigatorId);
  }

  private getNextPlayerId(playerId: string): string {
    const players = this.state.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);

    return players[(idx + 1) % players.length].id;
  }
}
