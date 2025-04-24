import { ILogService } from "./ILogService";
import { IMarketService } from "./IMarketService";

export type Services = {
  logService: ILogService;
  marketService: IMarketService;
};
