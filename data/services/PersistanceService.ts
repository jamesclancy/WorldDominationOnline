import { Decimal } from "@prisma/client/runtime";
import prisma from "../../lib/prisma";
import GameMap, {
  Continent,
  Territory,
  TerritoryBridge,
  TerritoryPathDefinition,
  toContinentNameKey,
  toCountryNameKey,
} from "../models/GameMap";
import {
  GameDetail,
  GameSummary,
  MapDefinition,
  TerritoryState,
} from "../models/GameState";
import {
  mapQueryResultToGameMap,
  mapQueryResultToGameSummary,
  mapQueryResultToTerritoryState,
} from "../record-manipulation/maps";
import {
  gameSummarySelectQueryDefinition,
  getGameStateSelectQueryDefinition,
  mapContentSelectQuery,
} from "../record-manipulation/queries";

const getAllPossibleMaps: () => Promise<MapDefinition[]> = async () => {
  const availableMaps = await prisma.mapRecord.findMany();
  return availableMaps.map((x) => ({ id: x.id, name: x.name }));
};

const getGameSummary: (gameId: string) => Promise<GameSummary | null> = async (
  gameId: string
) => {
  const availableMaps = await prisma.gameRecord.findUnique({
    where: {
      id: gameId,
    },
    select: gameSummarySelectQueryDefinition,
  });

  if (availableMaps === null) return null;

  const summary: GameSummary = mapQueryResultToGameSummary(availableMaps);

  return summary;
};

const getGameStates: (
  gameId: string
) => Promise<TerritoryState[] | null> = async (gameId: string) => {
  const availableMaps = await prisma.gameTerritoryStateRecord.findMany({
    where: {
      gameId: gameId,
    },
    select: getGameStateSelectQueryDefinition,
  });

  if (availableMaps === null) return null;

  const summary = availableMaps.map((x) => mapQueryResultToTerritoryState(x));

  return summary;
};

const getGameDetail: (gameId: string) => Promise<GameDetail | null> = async (
  gameId: string
) => {
  const gameSummary = await getGameSummary(gameId);
  if (gameSummary === null) return null;
  const gameMap = await getGameMap(gameSummary.map.id);
  const gameStates = await getGameStates(gameId);
  if (gameMap === null || gameStates === null) return null;

  return {
    ...gameSummary,
    currentMap: gameMap,
    currentTerritoryState: gameStates,
    currentTurn: gameSummary.currentTurnPlayer ?? gameSummary.player1,
  };
};

const getGameMap: (mapId: string) => Promise<GameMap | null> = async (
  mapId: string
) => {
  const availableMaps = await prisma.mapRecord.findUnique({
    where: {
      id: mapId,
    },
    select: mapContentSelectQuery,
  });

  if (availableMaps === undefined || availableMaps === null) return null;

  return mapQueryResultToGameMap(availableMaps);
};

const createGame = async (createRequest: {
  mapId: string;
  playerIds: string[];
  territorySelection: TerritoryState[];
}) => {
  const player1Name = createRequest.playerIds[0];
  const player2Name = createRequest.playerIds[1];

  const createdGame = await prisma.gameRecord.create({
    data: {
      map: {
        connect: {
          id: createRequest.mapId,
        },
      },
      player1: {
        connectOrCreate: {
          where: {
            name: player1Name,
          },
          create: {
            name: player1Name,
            displayName: player1Name,
          },
        },
      },
      player2: {
        connectOrCreate: {
          where: {
            name: player2Name,
          },
          create: {
            name: player2Name,
            displayName: player2Name,
          },
        },
      },
    },
  });

  const gameId = createdGame.id;

  const territoryLookup = await prisma.territoryRecord.findMany({
    where: {
      name: {
        in: createRequest.territorySelection.map((x) => x.territoryName),
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const playerLookup = await prisma.user.findMany({
    where: {
      name: {
        in: createRequest.playerIds,
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  const mapStateToDatabaseRecords = (
    x: TerritoryState,
    defaultPlayer: string,
    gameId: string
  ) => ({
    territoryId:
      territoryLookup.find((l) => l.name === x.territoryName)?.id ?? "",
    ownerId:
      playerLookup.find((pl) => pl.name === x.playerName ?? defaultPlayer)
        ?.id ?? "",
    armies: x.armies,
    gameId,
  });

  const upsertStates = await prisma.gameTerritoryStateRecord.createMany({
    data: createRequest.territorySelection.map((x) =>
      mapStateToDatabaseRecords(x, player1Name, gameId)
    ),
  });

  return gameId;
};

const getGameSummariesForUser: (
  userName: string
) => Promise<GameSummary[] | null> = async (userName: string) => {
  const availableMaps = await prisma.gameRecord.findMany({
    where: {
      AND: [
        {
          OR: [
            {
              player1: {
                name: userName,
              },
            },
            {
              player2: {
                name: userName,
              },
            },
          ],
        },
        {
          NOT: {
            currentTurnStep: "GameOver",
          },
        },
      ],
    },
    select: gameSummarySelectQueryDefinition,
  });

  if (availableMaps === null) return null;

  const summary: GameSummary[] = availableMaps.map((x) =>
    mapQueryResultToGameSummary(x)
  );

  return summary;
};

async function getPotentialOpponentsForPlayer(playerName: string): Promise<string[]> {
  const availableOpponents = await prisma.user.findMany({
    where: {
      NOT: {
        name: playerName,
      },
    },
    select: {
      name: true,
    },
  });

  return availableOpponents.map((x) => x.name);
}

export const PersistanceService = {
  getAllPossibleMaps,
  getGameSummary,
  getGameStates,
  getGameDetail,
  getGameMap,
  createGame,
  getGameSummariesForUser,
  getPotentialOpponentsForPlayer,
};

export default PersistanceService;
