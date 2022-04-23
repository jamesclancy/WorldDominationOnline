import GameMap, { CountryNameKey } from "./GameMap";
import Player from "./Player";

export type TerritoryState = {
  territoryName: string;
  playerName: null | string;
  armies: number;
};

export type GameState = {
  currentMap: GameMap;
  currentPlayers: [Player, Player];
  currentPositions: TerritoryState[];
  currentTurn: string;
  selectedTerritory: string | undefined;
  onClickTerritory(territoryName: string): void;
};

export interface MapDefinition {
  id: string;
  name: string;
}

export interface GameSummary {
  id: string;
  currentTurnStep: RoundStepType;
  currentTurnCount: number;
  map: MapDefinition;
  winningPlayer?: Player;
  currentTurnPlayer?: Player;
  player1: Player;
  player2: Player;
  startDate: string;
  updatedDate: string;
}

export interface GameDetail {
  id: string;
  currentTurnStep: RoundStepType;
  currentTurnCount: number;
  map: MapDefinition;
  winningPlayer?: Player;
  player1: Player;
  player2: Player;
  startDate: string;
  updatedDate: string;

  currentMap: GameMap;
  currentTerritoryState: TerritoryState[];
  currentTurn: Player;
}


const possibleRoundStepTypes = ["AddArmies", "Attack", "Movement", "InvalidValue", "GameOver"];

export function toRoundStepType(valueToTry: string) : RoundStepType {
  const contIndex = possibleRoundStepTypes.findIndex((x) => x === valueToTry);
  if (contIndex === -1) return "InvalidValue";
  return possibleRoundStepTypes[contIndex];
}

export type RoundStepType = typeof possibleRoundStepTypes[number];
