import { ILog } from "infrastructure/Log";
import { IGameFlow } from "./IGameFlow";
import { Turn } from "types/Turn";
import { IGameFlowState } from "./IGameFlowState";

export class GameFlow implements IGameFlow {
  constructor(
    private readonly state: IGameFlowState,
    private readonly logger: ILog
  ) {}

  nextPhase(): boolean {
    const turn = this.state.getTurn();

    switch (turn.phase) {
      case "Action":
        this.state.setPhase("Encounter");
        this.state.setCurrentInvestigatorId(turn.leadInvestigatorId);
        this.logger.add("gameflow.phase.set.encounter");
        break;
      case "Encounter":
        this.state.setPhase("Mythos");
        this.state.setCurrentInvestigatorId(turn.leadInvestigatorId);
        this.logger.add("gameflow.phase.set.mythos");
        break;
      case "Mythos":
        const newRound = turn.round + 1;
        this.state.setRound(newRound);
        const nextLead = this.getNextPlayerId(turn.leadInvestigatorId);
        this.state.setLeadInvestigatorId(nextLead);
        this.state.setCurrentInvestigatorId(nextLead);
        this.logger.add("gameflow.round.increment", {
          round: newRound,
        });
        break;
    }

    return true;
  }

  nextInvestigator(): boolean {
    const turn = this.state.getTurn();
    const players = this.state.getPlayers();
    const idx = players.findIndex((p) => p.id === turn.currentInvestigatorId);
    const next = players[(idx + 1) % players.length];

    this.state.setCurrentInvestigatorId(next.id);
    this.logger.add("gameFlow.nextInvestigator", {
      currentInvestigatorId: turn.currentInvestigatorId,
    });

    return true;
  }

  passLeadInvestigator(playerId: string): boolean {
    const player = this.state.getPlayers().find((p) => p.id === playerId);

    if (!player) return false;

    this.state.setLeadInvestigatorId(playerId);
    this.logger.add("gameFlow.passLeadInvestigator", {
      playerId,
    });

    return true;
  }

  getTurn(): Turn {
    return this.state.getTurn();
  }

  setTurn(turn: Turn): boolean {
    this.state.setPhase(turn.phase);
    this.state.setRound(turn.round);
    this.state.setLeadInvestigatorId(turn.leadInvestigatorId);
    this.state.setCurrentInvestigatorId(turn.currentInvestigatorId);

    return true;
  }

  private getNextPlayerId(playerId: string): string {
    const players = this.state.getPlayers();
    const idx = players.findIndex((p) => p.id === playerId);

    return players[(idx + 1) % players.length].id;
  }
}
