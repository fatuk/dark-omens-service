import { IClueService } from "./IClueService";
import { ILogService } from "./ILogService";
import { IMarketService } from "./IMarketService";
import { IPlayerService } from "./IPlayerService";

export type Services = {
  logService: ILogService;
  marketService: IMarketService;
  clueService: IClueService;
  playerService: IPlayerService;
};
