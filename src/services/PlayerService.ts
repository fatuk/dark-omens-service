import { PlayerState } from "types/PlayerState";
import { ILogService } from "types/ILogService";
import { IPlayerService } from "types/IPlayerService";
import { PlayerStateService } from "types/PlayerStateService";

const DEFAULT_MAX_ACTIONS = 2;

export class PlayerService implements IPlayerService {
  constructor(
    private readonly stateSvc: PlayerStateService,
    private readonly logger: ILogService,
    private readonly maxActions = DEFAULT_MAX_ACTIONS
  ) {}

  initialize(initialPlayers: PlayerState[]): void {
    const sorted = initialPlayers
      .slice()
      .sort((a, b) => a.turnOrder - b.turnOrder)
      .map((p) => ({ ...p, actionsTaken: [] }));

    sorted.forEach((p) => this.stateSvc.update(p));
    this.logger.add("Игроки инициализированы");
  }

  canTakeAction(playerId: string, actionType: string): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player) return false;
    return (
      player.actionsTaken.length < this.maxActions &&
      !player.actionsTaken.includes(actionType)
    );
  }

  recordAction(playerId: string, actionType: string): void {
    const player = this.stateSvc.getById(playerId);
    if (!player) return;
    if (!player.actionsTaken.includes(actionType)) {
      player.actionsTaken.push(actionType);
      this.stateSvc.update(player);
      this.logger.add(`Игрок ${playerId} выполнил действие: ${actionType}`);
    }
  }

  resetActions(): void {
    this.stateSvc.getAll().forEach((p) => {
      p.actionsTaken = [];
      this.stateSvc.update(p);
    });
    this.logger.add("Все действия игроков сброшены");
  }

  move(playerId: string, locationId: string): boolean {
    if (!this.canTakeAction(playerId, "move")) return false;

    const player = this.stateSvc.getById(playerId);
    if (!player) return false;

    player.locationId = locationId;
    this.recordAction(playerId, "move");
    this.logger.add(`Игрок ${playerId} переместился в ${locationId}`);
    this.stateSvc.update(player);
    return true;
  }

  healHealth(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.health;
    player.health = Math.min(player.health + amount, player.maxHealth);
    this.logger.add(
      `Игрок ${playerId} восстановил здоровье: ${old} → ${player.health}`
    );
    this.stateSvc.update(player);
    return true;
  }

  loseHealth(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.health;
    player.health = Math.max(player.health - amount, 0);
    this.logger.add(
      `Игрок ${playerId} потерял здоровье: ${old} → ${player.health}`
    );
    if (player.health === 0) {
      player.isDefeated = true;
      player.deathReason = "injury";
      this.logger.add(`Игрок ${playerId} погиб от ран`);
    }
    this.stateSvc.update(player);
    return true;
  }

  healSanity(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.sanity;
    player.sanity = Math.min(player.sanity + amount, player.maxSanity);
    this.logger.add(
      `Игрок ${playerId} восстановил рассудок: ${old} → ${player.sanity}`
    );
    this.stateSvc.update(player);
    return true;
  }

  loseSanity(playerId: string, amount: number): boolean {
    const player = this.stateSvc.getById(playerId);
    if (!player || amount <= 0 || player.isDefeated) return false;

    const old = player.sanity;
    player.sanity = Math.max(player.sanity - amount, 0);
    this.logger.add(
      `Игрок ${playerId} потерял рассудок: ${old} → ${player.sanity}`
    );
    if (player.sanity === 0) {
      player.isDefeated = true;
      player.deathReason = "sanity";
      this.logger.add(`Игрок ${playerId} сошел с ума`);
    }
    this.stateSvc.update(player);
    return true;
  }

  resolveEncounter(playerId: string): string {
    const player = this.stateSvc.getById(playerId);
    if (!player) return "Игрок не найден";

    const loc = player.locationId;
    let type = "generic";

    if (loc.startsWith("city")) type = "city";
    else if (loc.startsWith("other")) type = "otherWorld";
    else if (loc === "expedition") type = "expedition";
    else if (loc === "mysticRuins") type = "mysticRuins";

    this.logger.add(`Игрок ${playerId} проходит ${type} встречу в ${loc}`);
    return type;
  }

  restore(players: PlayerState[]): void {
    players.forEach((p) => this.stateSvc.update({ ...p }));
    this.logger.add("Состояние игроков восстановлено");
  }

  getAll(): PlayerState[] {
    return this.stateSvc.getAll();
  }

  getById(id: string): PlayerState | undefined {
    return this.stateSvc.getById(id);
  }
}
