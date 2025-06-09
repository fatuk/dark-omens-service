import { IClue } from "domain/Clue";
import { IGameFlow } from "application/GameFlow";
import { IGate } from "domain/Gate";
import { IMarket } from "domain/Market";
import { IPlayer } from "domain/Player";
import { ILog } from "infrastructure/Log";

export type Services = {
  log: ILog;
  market: IMarket;
  clue: IClue;
  player: IPlayer;
  gate: IGate;
  gameFlow: IGameFlow;
};
