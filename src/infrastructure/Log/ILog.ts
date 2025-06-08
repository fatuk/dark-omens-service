import { LogEntry, LogParams } from "types/Log";

export interface ILog {
  add(key: string, params?: LogParams): void;
  get(): LogEntry[];
  clear(): void;
}
