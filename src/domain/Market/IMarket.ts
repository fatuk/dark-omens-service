import { Asset } from "types/Asset";

export interface IMarket {
  replenish(): void;
  buy(cardId: string): Asset | null;
  discard(asset: Asset): void;
  getState(): Asset[];
  setState(ids: string[]): void;
}
