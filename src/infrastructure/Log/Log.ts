import { LogEntry, LogParams } from "types/Log";
import { ILog } from "./ILog";
import { ILogState } from "./ILogState";

export class Log implements ILog {
  constructor(private readonly state: ILogState) {}

  add(key: string, params?: LogParams): void {
    const timestamp = new Date().toLocaleString();

    this.state.add({ key, params, timestamp });
  }

  getState() {
    return this.state.getState();
  }

  setState(logs: LogEntry[]): void {
    this.state.setState(logs);
  }
}
