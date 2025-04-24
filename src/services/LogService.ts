import { ILogService } from "types/ILogService";

export class LogService implements ILogService {
  private log: string[] = [];

  add(message: string): void {
    this.log.push(`[${new Date().toLocaleString()}] ${message}`);
  }

  get(): string[] {
    return [...this.log];
  }

  clear(): void {
    this.log = [];
  }
}
