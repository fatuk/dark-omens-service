import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

const savedState = {
  asset: {
    drawPile: ["asset_001", "asset_002"],
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

  const [assetDb, spellDb, conditionDb] = await Promise.all([
    assetRepo.getMap(),
    spellRepo.getMap(),
    conditionRepo.getMap(),
  ]);

  const allDecks = new AllDecksManager({
    asset: { deck: [], db: assetDb },
    spell: { deck: [], db: spellDb },
    condition: {
      deck: [],
      db: conditionDb,
    },
  });

  const game = new GameService(allDecks);
  game.restoreFromState(
    {
      decks: savedState,
      log: [],
    },
    {
      asset: assetDb,
      spell: spellDb,
      condition: conditionDb,
    }
  );
  window.game = game;
};
init();
