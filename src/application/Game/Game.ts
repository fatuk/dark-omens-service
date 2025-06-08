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
import { IAllDecks } from "infrastructure/AllDecks";
import { LogEntry } from "types/Log";

export class Game {
  private decks: IAllDecks;
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

  constructor(decks: IAllDecks, players: PlayerState[], services: Services) {
    this.services = services;
    this.decks = decks;
    const sorted = this.services.player
      .getAll()
      .sort((a, b) => a.turnOrder - b.turnOrder);
    this.turn.leadInvestigatorId = sorted[0]?.id ?? "";
    this.turn.currentInvestigatorId = this.turn.leadInvestigatorId;
    this.services.player.resetActions();
    this.services.player.initialize(players);
    this.services.market.replenish();
  }

  drawClue(): string | null {
    return this.services.clue.draw();
  }

  discardClue(clueId: string): boolean {
    return this.services.clue.discard(clueId);
  }

  getCluesState(): Clue[] {
    return this.services.clue.getAll();
  }

  drawGate(): string | null {
    return this.services.gate.draw();
  }

  closeGate(gateId: string): boolean {
    return this.services.gate.discard(gateId);
  }

  getOpenedGatesState(): Gate[] {
    return this.services.gate.getAll();
  }

  drawCard<T extends CardType>(type: T): CardMap[T] | null {
    const card = this.decks.draw(type);
    if (card) this.services.log.add(`Вытянута карта: ${card.name}`);
    return card;
  }

  discardCard<T extends CardType>(type: T, card: CardMap[T]): void {
    this.decks.discard(type, card);
    this.services.log.add(`Сброшена карта: ${card.name}`);
  }

  shuffleDeck<T extends CardType>(type: T): void {
    this.decks.shuffle(type);
    this.services.log.add(`Перемешана колода: ${type}`);
  }

  getState(): GameState {
    return {
      turn: { ...this.turn },
      market: this.services.market.getAll().map((c) => c.id),
      log: this.services.log.get(),
      players: this.services.player.getAll(),
      openGates: [...this.openGates],
      decks: this.decks.getState(),
      clues: this.services.clue.getAll().map((c) => c.id),
    };
  }

  getMarketState(): Asset[] {
    return this.services.market.getAll();
  }

  replenishMarket(): void {
    this.services.market.replenish();
  }

  buyFromMarket(cardId: string): Asset | null {
    return this.services.market.buy(cardId);
  }

  getPlayerState(
    playerId: string
  ): (PlayerState & { assets: Asset[]; conditions: Condition[] }) | null {
    const player = this.services.player.getById(playerId);
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
    return this.services.player.canTakeAction(playerId, action);
  }

  recordAction(playerId: string, action: string): void {
    this.services.player.recordAction(playerId, action);
  }

  resetActions(): void {
    this.services.player.resetActions();
  }

  resolveEncounter(playerId: string): string {
    return this.services.player.resolveEncounter(playerId);
  }

  movePlayer(playerId: string, location: string): boolean {
    return this.services.player.move(playerId, location);
  }

  healHealth(playerId: string, amount: number): boolean {
    return this.services.player.healHealth(playerId, amount);
  }

  loseHealth(playerId: string, amount: number): boolean {
    return this.services.player.loseHealth(playerId, amount);
  }

  healSanity(playerId: string, amount: number): boolean {
    return this.services.player.healSanity(playerId, amount);
  }

  loseSanity(playerId: string, amount: number): boolean {
    return this.services.player.loseSanity(playerId, amount);
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

    this.services.market.restore(state.market);
    this.services.clue.restore(state.clues);
    this.services.player.restore(state.players);

    this.services.log.clear();
    state.log.forEach((msg) => this.services.log.add(msg));
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

  getLog(): LogEntry[] {
    return this.services.log.get();
  }
}
