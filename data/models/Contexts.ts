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
  roundCounter: 0,
  selectedTerritory: undefined,
  currentTurnOutstandingArmies: 0,
  detailRequestedTerritory: undefined,
  winner: undefined,
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
  roundCounter: 0,
  currentPositions: [],
  currentTurn: "Player 1",
  roundStep: "Movement",
  selectedTerritory: undefined,
  applyArmies: (x, y) => {},
  onSelect: (x) => {},
  currentTurnOutstandingArmies: 0,
  onShowDetail: (x) => {},
  detailRequestedTerritory: undefined,
  winner: undefined,
};

export const GameContext = React.createContext<IGameContext>(emptyContext);
export const WorldMapContext =
  React.createContext<ITileContext>(emptyMapContext);

export interface IGameContext {
  winner: string | undefined;
  roundCounter: number;
  currentMap: GameMap;
  roundStep: RoundStepType;
  currentPlayers: [Player, Player];
  currentPositions: TerritoryState[];
  currentTurn: string;
  currentTurnOutstandingArmies: number;
  selectedTerritory: CountryNameKey | undefined;
  detailRequestedTerritory: CountryNameKey | undefined;
}

export interface ITileContext extends IGameContext {
  applyArmies(territoryName: CountryNameKey, selectedArmies: number): void;
  onSelect(territoryName: CountryNameKey): void;
  onShowDetail(territoryName: CountryNameKey | undefined): void;
}
