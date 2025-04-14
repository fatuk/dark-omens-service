import { Card } from "types/Card";
import { DeckManager } from "./DeckManager";
import { AssetRepository } from "repositories/AssetRepository";

export class GameService {
  private cardDb: Map<string, Card>;
  private deckManager: DeckManager;

  constructor(cardDb: Map<string, Card>) {
    this.cardDb = cardDb;
    this.deckManager = new DeckManager(cardDb);
  }

  async init() {
    const assetRepo = new AssetRepository();
    const assets = await assetRepo.getAll();
    this.deckManager.initializeDeck("asset", assets);
  }

  drawAsset(): Card | null {
    return this.deckManager.draw("asset");
  }

  save(): any {
    return {
      deckManager: this.deckManager.getState(),
    };
  }
}
