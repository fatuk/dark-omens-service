import { AllDecksManager } from "./AllDeckManager";
import { Asset } from "types/Asset";
import { Condition } from "types/Condition";
import { CardMap, CardType } from "types/Card";
import { GameAction } from "types/GameAction";
import { PlayerState } from "types/PlayerState";
import { GameState } from "types/GameState";
import { Gate } from "types/Gate";
import { Clue } from "types/Clue";
import { Services } from "types/Services";
import { resolveCards } from "helpers/resolveCards";

export class GameService {
  private decks: AllDecksManager;
  private log: string[] = [];
  private turn: GameState["turn"] = {
    round: 1,
    phase: "Action",
    leadInvestigatorId: "",
    currentInvestigatorId: "",
  };
  private players: PlayerState[] = [];
  private openGates: string[] = [];
  private services: Services;

  constructor(
    decks: AllDecksManager,
    players: PlayerState[],
    services: Services
  ) {
    this.services = services;
    this.decks = decks;
    const sorted = this.services.playerService
      .getAll()
      .sort((a, b) => a.turnOrder - b.turnOrder);
    this.turn.leadInvestigatorId = sorted[0]?.id ?? "";
    this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
    this.services.playerService.initialize(players);
    this.services.marketService.replenish();

    services.playerService.resetActions();
    services.playerService.initialize(players);
  }

  drawClue(): string | null {
    return this.services.clueService.draw();
  }

  discardClue(clueId: string): boolean {
    return this.services.clueService.discard(clueId);
  }

  getCluesState(): Clue[] {
    return this.services.clueService.getAll();
  }

  drawGate(): Gate | null {
    const gate = this.decks.draw("gate") as Gate | null;
    if (!gate) return null;
    this.openGates.push(gate.location);
    this.log.push(`Открылись врата в ${gate.location} (${gate.color})`);
    return gate;
  }

  closeGate(locationName: string): boolean {
    const index = this.openGates.findIndex((gate) => gate === locationName);
    if (index === -1) return false;
    this.openGates.splice(index, 1);
    this.log.push(`Врата в ${locationName} были закрыты`);
    return true;
  }

  getOpenedGatesState(): Gate[] {
    return this.openGates
      .map((location) => this.decks.getCardById("gate", `gate-${location}`))
      .filter(Boolean) as Gate[];
  }

  drawCard<T extends CardType>(type: T): CardMap[T] | null {
    const card = this.decks.draw(type);
    if (card) this.services.logService.add(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard<T extends CardType>(type: T, card: CardMap[T]): void {
    this.decks.discard(type, card);
    this.services.logService.add(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck<T extends CardType>(type: T): void {
    this.decks.shuffle(type);
    this.services.logService.add(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      turn: { ...this.turn },
      market: this.services.marketService.getAll().map((c) => c.id),
      log: this.services.logService.get(),
      players: this.services.playerService.getAll(),
      openGates: [...this.openGates],
      decks: this.decks.getState(),
      clues: this.services.clueService.getAll().map((c) => c.id),
    };
  }

  getMarketState(): Asset[] {
    return this.services.marketService.getAll();
  }

  replenishMarket(): void {
    this.services.marketService.replenish();
  }

  buyFromMarket(cardId: string): Asset | null {
    return this.services.marketService.buy(cardId);
  }

  getPlayerState(
    playerId: string
  ): (PlayerState & { assets: Asset[]; conditions: Condition[] }) | null {
    const player = this.services.playerService.getById(playerId);
    if (!player) return null;

    const assets = resolveCards(player.assetIds, (id) =>
      this.decks.getCardById("asset", id)
    );

    const conditions = resolveCards(player.conditionIds, (id) =>
      this.decks.getCardById("condition", id)
    );

    if (!assets || !conditions) return null;

    return { ...player, assets, conditions };
  }

  canTakeAction(playerId: string, action: string): boolean {
    return this.services.playerService.canTakeAction(playerId, action);
  }

  recordAction(playerId: string, action: string): void {
    this.services.playerService.recordAction(playerId, action);
  }

  resetActions(): void {
    this.services.playerService.resetActions();
  }

  resolveEncounter(playerId: string): string {
    return this.services.playerService.resolveEncounter(playerId);
  }

  movePlayer(playerId: string, location: string): boolean {
    return this.services.playerService.move(playerId, location);
  }

  healHealth(playerId: string, amount: number): boolean {
    return this.services.playerService.healHealth(playerId, amount);
  }

  loseHealth(playerId: string, amount: number): boolean {
    return this.services.playerService.loseHealth(playerId, amount);
  }

  healSanity(playerId: string, amount: number): boolean {
    return this.services.playerService.healSanity(playerId, amount);
  }

  loseSanity(playerId: string, amount: number): boolean {
    return this.services.playerService.loseSanity(playerId, amount);
  }

  getEncounterType(locationId: string): string {
    if (locationId.startsWith("city")) return "city";
    if (locationId.startsWith("other")) return "otherWorld";
    if (locationId === "expedition") return "expedition";
    if (locationId === "mysticRuins") return "mysticRuins";
    return "generic";
  }

  nextPhase() {
    switch (this.turn.phase) {
      case "Action":
        this.turn.phase = "Encounter";
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.resetActions();
        this.log.push("Фаза: встречи");
        break;
      case "Encounter":
        this.turn.phase = "Mythos";
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.log.push("Фаза: мифов");
        break;
      case "Mythos":
        this.turn.phase = "Action";
        this.turn.round++;
        this.passLeadInvestigator();
        this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
        this.resetActions();
        this.log.push(`Раунд ${this.turn.round}`);
        break;
    }
  }

  nextInvestigator() {
    const index = this.players.findIndex(
      (p) => p.id === this.turn.currentInvestigatorId
    );
    if (index === -1) return;
    const next = this.players[(index + 1) % this.players.length];
    this.turn.currentInvestigatorId = next.id;
    this.log.push(`Ход переходит к игроку: ${next.id}`);
  }

  passLeadInvestigator() {
    const index = this.players.findIndex(
      (p) => p.id === this.turn.leadInvestigatorId
    );
    const next = this.players[(index + 1) % this.players.length];
    this.turn.leadInvestigatorId = next.id;
    this.log.push(`Новый лидер: ${next.id}`);
  }

  restoreFromState(
    state: GameState,
    dbs: {
      [K in keyof CardMap]: Map<string, CardMap[K]>;
    }
  ) {
    this.turn = state.turn;
    this.decks.restoreFromState(state.decks, dbs);
    this.log = state.log;
    this.openGates = state.openGates;

    this.services.marketService.restore(state.market);
    this.services.clueService.restore(state.clues);
    this.services.playerService.restore(state.players);

    this.services.logService.clear();
    state.log.forEach((msg) => this.services.logService.add(msg));
  }

  apply(action: GameAction) {
    switch (action.type) {
      case "DRAW_CARD":
        return this.drawCard(action.cardType);
      case "DISCARD_CARD":
        return this.discardCard(action.cardType, action.card);
      case "SHUFFLE_DECK":
        return this.shuffleDeck(action.cardType);
    }
  }

  getLog(): string[] {
    return this.services.logService.get();
  }
}
