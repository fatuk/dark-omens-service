export type PlayerState = {
  id: string;
  userId: string;
  investigatorId: string;
  turnOrder: number;
  isOnline: boolean;
  health: number;
  sanity: number;
  locationId: string;
  assetIds: string[];
  actionsTaken: string[];
  conditionIds: string[];
  clueCount: number;
  focusCount: number;
  resourceCount: number;
};
