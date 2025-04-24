import { Asset } from "types/Asset";
import { resolveCards } from "helpers/resolveCards";
import { DeckManager } from "./DeckManager";
import { ILogService } from "types/ILogService";
import { IMarketService } from "types/IMarketService";

const DEFAULT_MAX_MARKET_CARDS = 4;

export interface MarketState {
  getMarketIds(): string[];
  setMarketIds(ids: string[]): void;
  getAssetById(id: string): Asset | undefined;
}

export class MarketService implements IMarketService {
  private readonly maxSize: number;

  constructor(
    private readonly deck: DeckManager<Asset>,
    private readonly state: MarketState,
    private readonly logger: ILogService,
    maxSize = DEFAULT_MAX_MARKET_CARDS
  ) {
    this.maxSize = maxSize;
  }

  replenish(): void {
    const ids = [...this.state.getMarketIds()];
    while (ids.length < this.maxSize) {
      const card = this.deck.draw();
      if (!card) break;
      ids.push(card.id);
      this.logger.add(`Добавлена карта в маркет: ${card.name}`);
    }
    this.state.setMarketIds(ids);
  }

  buy(cardId: string): Asset | null {
    const ids = [...this.state.getMarketIds()];
    const index = ids.indexOf(cardId);
    if (index === -1) return null;

    ids.splice(index, 1);
    this.state.setMarketIds(ids);

    const asset = this.state.getAssetById(cardId) ?? null;
    if (asset) {
      this.logger.add(`Куплена карта: ${asset.name}`);
      this.replenish();
    }
    return asset;
  }

  discard(asset: Asset): void {
    this.deck.discard(asset);
    this.logger.add(`Карта сброшена в маркет: ${asset.name}`);
  }

  getAll(): Asset[] {
    return resolveCards(this.state.getMarketIds(), (id) =>
      this.state.getAssetById(id)
    );
  }
}
