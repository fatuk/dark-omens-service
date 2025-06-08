import { LogEntry, LogParams } from "types/Log";
import { ILog } from "./ILog";

export class Log implements ILog {
  private logs: LogEntry[] = [];

  add(key: string, params?: LogParams): void {
    const timestamp = new Date().toLocaleString();
    this.logs.push({ key, params, timestamp });
  }

  get(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
