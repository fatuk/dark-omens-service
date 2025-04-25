import { Asset } from "./Asset";

export interface MarketStateService {
  getMarketIds(): string[];
  setMarketIds(ids: string[]): void;
  getAssetById(id: string): Asset | undefined;
}
