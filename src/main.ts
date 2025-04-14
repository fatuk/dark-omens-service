import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";

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

  const [assetsMap, spellsMap, conditionsMap] = await Promise.all([
    assetRepo.getMap(),
    spellRepo.getMap(),
    conditionRepo.getMap(),
  ]);

  const allDecks = new AllDecksManager({
    asset: { deck: [], db: assetsMap },
    spell: { deck: [], db: spellsMap },
    condition: {
      deck: [],
      db: conditionsMap,
    },
  });
  allDecks.restoreFromState(savedState, {
    asset: assetsMap,
    spell: spellsMap,
    condition: conditionsMap,
  });
  window.allDecks = allDecks;
};
init();
