import { Asset } from "types/Asset";

export interface IMarket {
  replenish(): void;
  buy(cardId: string): Asset | null;
  discard(asset: Asset): void;
  getAll(): Asset[];
  restore(ids: string[]): void;
}
