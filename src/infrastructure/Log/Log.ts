import { ILog } from "./ILog";

export class Log implements ILog {
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
