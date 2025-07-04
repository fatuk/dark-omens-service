import { CardMap } from "./Card";
import { DeckManagerState } from "./DeckManagerState";
import { LogEntry } from "./Log";
import { PlayerState } from "./PlayerState";
import { Turn } from "./Turn";

export type GameState = {
  turn: Turn;
  decks: { [K in keyof CardMap]: DeckManagerState };
  market: string[];
  log: LogEntry[];
  players: PlayerState[];
  openGates: string[];
  clues: string[];
  pendingEncounter?: {
    playerId: string;
    encounterId: string;
  } | null;
};
