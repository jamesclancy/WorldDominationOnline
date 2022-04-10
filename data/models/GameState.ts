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

export type RoundStepType = "AddArmies" | "Attack" | "Movement";
