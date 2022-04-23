import { IGameContext, ITileContext } from "../models/Contexts";
import GameMap, { Continent, Territory, TerritoryBridge, TerritoryPathDefinition } from "../models/GameMap";
import { GameState } from "../models/GameState";
import Player from "../models/Player";
import { api } from "./Remote";

export interface IConstructNewGameDependencies {}

export async function constructEmptyWorldMapContext(): Promise<ITileContext> {
  let gameContext = await constructInitialGameContext();
  let context: ITileContext = {
    ...gameContext,
    onClick: (x) => {},
    applyArmies: (x, y) => {},
  };
  return context;
}

export async function constructInitialGameContext(): Promise<IGameContext> {
  var newGame = await constructNewGame({});
  let context: IGameContext = {
    roundStep: "Attack",
    currentMap: newGame.currentMap,
    currentPlayers: newGame.currentPlayers,
    currentPositions: [],
    currentTurn: newGame.currentPlayers[0].name,
    selectedTerritory: undefined,
    currentTurnOutstandingArmies: 0,
  };

  return context;
}

async function constructNewGame(args: IConstructNewGameDependencies): Promise<GameState> {
  const continents: Continent[] = await api.get<Continent[]>("/game-data/standard/continents.json");
  const territories: Territory[] = await api.get<Territory[]>("/game-data/standard/territories.json");
  const territoryBridges: TerritoryBridge[] = await api.get<TerritoryBridge[]>(
    "/game-data/standard/territory-bridges.json"
  );
  const territoryPathDefinitions: TerritoryPathDefinition[] = await api.get<TerritoryPathDefinition[]>(
    "/game-data/standard/territory-path-definitions.json"
  );

  const map: GameMap = {
    continents,
    territories,
    territoryBridges,
    territoryPathDefinitions,
  };

  const players: [Player, Player] = [
    { name: "player1", displayName: "Player 1" },
    { name: "player2", displayName: "Player 2" },
  ];

  return {
    currentMap: map,
    currentPlayers: players,
    currentPositions: [],
    currentTurn: "player1",
    selectedTerritory: undefined,
    onClickTerritory: (s) => {},
  };
}
