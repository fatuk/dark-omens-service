import { AllDecksManager } from "services/AllDeckManager";
import { PlayerState } from "types/PlayerState";
import { GameService } from "services/GameService";
import { getFakeAssets } from "./getFakeAsset";
import { getFakeGates } from "./getFakeGates";
import { getFakeClues } from "./getFakeClues";
import { getFakeConditions } from "./getFakeConditions";
import { getFakeSpells } from "./getFakeSpells";
import { getFakePlayers } from "./getFakePlayers";

export const initTestGame = async () => {
  const deckParams = {
    asset: { deck: getFakeAssets(5), db: new Map() },
    spell: { deck: getFakeSpells(5), db: new Map() },
    condition: { deck: getFakeConditions(5), db: new Map() },
    gate: { deck: getFakeGates(5), db: new Map() },
    clue: { deck: getFakeClues(5), db: new Map() },
  };

  for (const type in deckParams) {
    for (const card of deckParams[type as keyof typeof deckParams].deck) {
      deckParams[type as keyof typeof deckParams].db.set(card.id, card);
    }
  }

  const decks = new AllDecksManager(deckParams);
  const players: PlayerState[] = getFakePlayers(4);

  return new GameService(decks, players);
};
