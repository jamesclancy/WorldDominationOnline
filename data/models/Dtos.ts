import { TerritoryState } from "./GameState";

export interface CreateGameRequest {
  mapId: string;
  playerIds: string[];
  territorySelection: TerritoryState[];
}

export interface CreateGameResponse {
  gameId: string
}

export interface FailureReport {
  failureMessage: string;
}