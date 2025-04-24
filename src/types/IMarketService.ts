import { Asset } from "./Asset";

export interface IMarketService {
  replenish(): void;
  buy(cardId: string): Asset | null;
  discard(asset: Asset): void;
  getAll(): Asset[];
  restore(ids: string[]): void;
}
