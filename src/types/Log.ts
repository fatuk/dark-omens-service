export type LogParams = Record<string, any>;

export type LogEntry = {
  key: string;
  params?: LogParams;
  timestamp: string;
};
