import { TerritoryState } from "./GameState";

export interface CreateGameRequest {
  mapId: string;
  playerIds: string[];
  territorySelection: TerritoryState[];
}

export interface CreateGameResponse {
  type: 'CreateGameResponse';
  gameId: string;
}

export interface FailureReport {
  type: 'FailureReport';
  failureMessage: string;
}

export interface AddGameEventResponse {
  type: 'AddGameEventResponse';
}