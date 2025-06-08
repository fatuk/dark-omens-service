import { CardMap } from "./Card";
import { DeckManagerState } from "./DeckManagerState";
import { GamePhase } from "./GamePhase";
import { LogEntry } from "./Log";
import { PlayerState } from "./PlayerState";

export type GameState = {
  turn: {
    round: number;
    phase: GamePhase;
    leadInvestigatorId: string;
    currentInvestigatorId: string;
  };
  decks: { [K in keyof CardMap]: DeckManagerState };
  market: string[];
  log: LogEntry[];
  players: PlayerState[];
  openGates: string[];
  clues: string[];
};
