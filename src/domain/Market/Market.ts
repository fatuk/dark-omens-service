import { Asset } from "types/Asset";
import { resolveCards } from "helpers/resolveCards";
import { IMarket } from "./IMarket";
import { MarketStateService } from "types/MarketStateService";
import type { IDeck } from "infrastructure/Deck";
import { ILog } from "infrastructure/Log";

const DEFAULT_MAX_MARKET_CARDS = 4;

export class Market implements IMarket {
  private readonly maxSize: number;

  constructor(
    private readonly deck: IDeck<Asset>,
    private readonly state: MarketStateService,
    private readonly logger: ILog,
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
      this.logger.add("market.asset.replenish", {
        assetId: card.id,
        assetName: card.name,
      });
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
      this.logger.add("market.asset.buy", {
        assetId: asset.id,
        assetName: asset.name,
      });
      this.replenish();
    }
    return asset;
  }

  discard(asset: Asset): void {
    this.deck.discard(asset);
    this.logger.add("market.asset.discard", {
      assetId: asset.id,
      assetName: asset.name,
    });
  }

  getAll(): Asset[] {
    return resolveCards(this.state.getMarketIds(), (id) =>
      this.state.getAssetById(id)
    );
  }

  restore(ids: string[]): void {
    this.state.setMarketIds(ids);
    const assets = resolveCards(ids, (id) => this.state.getAssetById(id));

    if (assets.length > 0) {
      this.logger.add(
        `Восстановлен маркет: ${assets.map((a) => a.name).join(", ")}`
      );
    } else {
      this.logger.add("Маркет восстановлен, но карты не найдены");
    }
    this.replenish();
  }
}
