import { SpellRepository } from "repositories/SpellRepository";
import { AssetRepository } from "./repositories/AssetRepository";
import { AllDecksManager } from "services/AllDeckManager";
import { ConditionRepository } from "repositories/ConditionRepository";
import { GameService } from "services/GameService";

import players from "data/players.json";
import { GateRepository } from "repositories/GateRepository";

const init = async () => {
  const assetRepo = new AssetRepository();
  const spellRepo = new SpellRepository();
  const conditionRepo = new ConditionRepository();
  const gateRepos = new GateRepository();

  const [assets, spells, conditions, gates] = await Promise.all([
    assetRepo.getAll(),
    spellRepo.getAll(),
    conditionRepo.getAll(),
    gateRepos.getAll(),
  ]);

  const assetDb = new Map(assets.map((c) => [c.id, c]));
  const spellDb = new Map(spells.map((c) => [c.id, c]));
  const conditionDb = new Map(conditions.map((c) => [c.id, c]));
  const gateDb = new Map(gates.map((c) => [c.id, c]));

  const allDecks = new AllDecksManager({
    asset: { deck: assets, db: assetDb },
    spell: { deck: spells, db: spellDb },
    condition: {
      deck: conditions,
      db: conditionDb,
    },
    gate: { deck: gates, db: gateDb },
  });

  const game = new GameService(allDecks, players);

  // game.restoreFromState(
  //   {},
  //   {
  //     asset: assetDb,
  //     spell: spellDb,
  //     condition: conditionDb,
  //     gate: gateDb,
  //   }
  // );
  window.game = game;
};
init();
