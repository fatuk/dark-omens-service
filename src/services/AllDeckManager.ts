import { Condition } from "types/Condition";
import { Asset } from "types/Asset";
import { Spell } from "types/Spell";
import { DeckManager, DeckManagerState } from "./DeckManager";
import { Card, CardType } from "types/Card";

export class AllDecksManager {
  asset: DeckManager<Asset>;
  spell: DeckManager<Spell>;
  condition: DeckManager<Condition>;

  constructor(params: {
    asset: { deck: Asset[]; db: Map<string, Asset> };
    spell: { deck: Spell[]; db: Map<string, Spell> };
    condition: { deck: Condition[]; db: Map<string, Condition> };
  }) {
    this.asset = new DeckManager(params.asset.db);
    this.asset.initialize(params.asset.deck);

    this.spell = new DeckManager(params.spell.db);
    this.spell.initialize(params.spell.deck);

    this.condition = new DeckManager(params.condition.db);
    this.condition.initialize(params.condition.deck);
  }

  draw(type: "asset"): Asset | null;
  draw(type: "spell"): Spell | null;
  draw(type: "condition"): Condition | null;
  draw(type: CardType): Card | null;
  draw(type: CardType) {
    return this[type].draw();
  }

  shuffle(type: "asset"): void;
  shuffle(type: "spell"): void;
  shuffle(type: "condition"): void;
  shuffle(type: CardType): Card | void;
  shuffle(type: CardType) {
    this[type].shuffleDrawPile();
  }

  getState(): {
    asset: DeckManagerState;
    spell: DeckManagerState;
    condition: DeckManagerState;
  } {
    return {
      asset: this.asset.getState(),
      spell: this.spell.getState(),
      condition: this.condition.getState(),
    };
  }

  restoreFromState(
    state: {
      asset: DeckManagerState;
      spell: DeckManagerState;
      condition: DeckManagerState;
    },
    dbs: {
      asset: Map<string, Asset>;
      spell: Map<string, Spell>;
      condition: Map<string, Condition>;
    }
  ) {
    this.asset = new DeckManager(dbs.asset);
    this.asset.restoreFromState(state.asset);

    this.spell = new DeckManager(dbs.spell);
    this.spell.restoreFromState(state.spell);

    this.condition = new DeckManager(dbs.condition);
    this.condition.restoreFromState(state.condition);
  }
}
