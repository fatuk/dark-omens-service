import { LogEntry, LogParams } from "types/Log";

export interface ILog {
  add(key: string, params?: LogParams): void;
  getState(): LogEntry[];
  setState(logs: LogEntry[]): void;
}
