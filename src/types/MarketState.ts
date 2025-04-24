import { Asset } from "./Asset";

export interface MarketState {
  getMarketIds(): string[];
  setMarketIds(ids: string[]): void;
  getAssetById(id: string): Asset | undefined;
}
