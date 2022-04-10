import React from "react";
import GameMap, { CountryNameKey } from "./GameMap";
import { RoundStepType, TerritoryState } from "./GameState";
import Player from "./Player";

const emptyContext: IGameContext = {
  currentMap: {
    continents: [],
    territories: [],
    territoryBridges: [],
    territoryPathDefinitions: [],
  },
  currentPlayers: [
    { name: "Player 1", displayName: "Player 1" },
    { name: "Player 2", displayName: "Player 2" },
  ],
  currentPositions: [],
  currentTurn: "Player 1",
  roundStep: "Attack",
  selectedTerritory: undefined,
  currentTurnOutstandingArmies: 0,
};

const emptyMapContext: ITileContext = {
  currentMap: {
    continents: [],
    territories: [],
    territoryBridges: [],
    territoryPathDefinitions: [],
  },
  currentPlayers: [
    { name: "Player 1", displayName: "Player 1" },
    { name: "Player 2", displayName: "Player 2" },
  ],
  currentPositions: [],
  currentTurn: "Player 1",
  roundStep: "Movement",
  selectedTerritory: undefined,
  applyArmies: (x, y) => {},
  onClick: (x) => {},
  currentTurnOutstandingArmies: 0,
};

export const GameContext = React.createContext<IGameContext>(emptyContext);
export const WorldMapContext = React.createContext<ITileContext>(emptyMapContext);

export interface IGameContext {
  currentMap: GameMap;
  roundStep: RoundStepType;
  currentPlayers: [Player, Player];
  currentPositions: TerritoryState[];
  currentTurn: string;
  currentTurnOutstandingArmies: number;
  selectedTerritory: CountryNameKey | undefined;
}

export interface ITileContext extends IGameContext {
  applyArmies(territoryName: CountryNameKey, selectedArmies: number): void;
  onClick(territoryName: CountryNameKey): void;
}
