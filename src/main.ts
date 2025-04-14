import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

const savedState = {
  asset: {
    drawPile: ["asset_001", "asset_002", "asset_003", "asset_004", "asset_005"],
    discardPile: [],
    removedFromGame: [],
  },
  spell: {
    drawPile: ["spell_astral_travel"],
    discardPile: [],
    removedFromGame: [],
  },
  condition: {
    drawPile: ["condition_blessed"],
    discardPile: [],
    removedFromGame: [],
  },
};

const init = async () => {
  const assetRepo = new AssetRepository();
  const spellRepo = new SpellRepository();
  const conditionRepo = new ConditionRepository();

  const [assets, spells, conditions] = await Promise.all([
    assetRepo.getAll(),
    spellRepo.getAll(),
    conditionRepo.getAll(),
  ]);

  const assetDb = new Map(assets.map((c) => [c.id, c]));
  const spellDb = new Map(spells.map((c) => [c.id, c]));
  const conditionDb = new Map(conditions.map((c) => [c.id, c]));

  const allDecks = new AllDecksManager({
    asset: { deck: assets, db: assetDb },
    spell: { deck: spells, db: spellDb },
    condition: {
      deck: conditions,
      db: conditionDb,
    },
  });

  const game = new GameService(allDecks);
  // game.restoreFromState(
  //   {
  //     decks: savedState,
  //     log: [],
  //     market: [],
  //   },
  //   {
  //     asset: assetDb,
  //     spell: spellDb,
  //     condition: conditionDb,
  //   }
  // );
  window.game = game;
};
init();
