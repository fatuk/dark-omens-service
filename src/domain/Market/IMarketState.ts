import { Asset } from "types/Asset";

export interface IMarketState {
  getMarketIds(): string[];
  setMarketIds(ids: string[]): void;
  getAssetById(id: string): Asset | undefined;
}
