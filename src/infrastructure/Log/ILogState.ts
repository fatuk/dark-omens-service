import { LogEntry } from "types/Log";

export interface ILogState {
  add(logEntry: LogEntry): void;
  getState(): LogEntry[];
  setState(logs: LogEntry[]): void;
}
