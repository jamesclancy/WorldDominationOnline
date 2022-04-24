import internal from "stream";
import { GameSummary, HistoricalEvent, RoundStepType, TerritoryState } from "./GameState";
import Player from "./Player";

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


export interface RecentGameEventResponse {
  type: 'RecentGameEventResponse';
  startingRoundCount: number;

  CurrentPlayerTurn: Player | undefined;
  CurrentTurn: number;
  CurrentTurnRoundStep: RoundStepType;

  UpdatedTerritoryStates: TerritoryState[];

  eventDetails: HistoricalEvent[]
}

export interface GameSummariesForUserResponse {
  type: 'GameSummariesForUserResponse';
  gameSummaries:GameSummary[];
}