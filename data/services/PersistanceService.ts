import prisma from "../../lib/prisma";
import {
  GameDetail,
  GameSummary,
  HistoricalEvent,
  MapDefinition,
  TerritoryState,
} from "../models/GameState";
import Player from "../models/Player";
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

async function getPotentialOpponentsForPlayer(
  playerName: string
): Promise<string[]> {
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

const findPlayerIdForName = async (playerName: string) =>
  (
    await prisma.user.findFirst({
      where: { name: playerName },
      select: { id: true },
    })
  )?.id;

const findTerritoryIdForName = async (territoryName: string | undefined) =>
  territoryName === undefined
    ? undefined
    : (
        await prisma.territoryRecord.findFirst({
          where: { name: territoryName },
          select: { id: true },
        })
      )?.id;

async function getGameEvents(
  gameId: string,
  startAt: number
): Promise<
  [
    currentPlayer: Player,
    currentTurn: number,
    currentRoundStep: string,
    updatedTerritoryStates: TerritoryState[],
    historicalEvents: HistoricalEvent[]
  ]
> {
  const game = await prisma.gameRecord.findUnique({
    where: { id: gameId },
    select: {
      currentTurn: true,
      currentTurnStep: true,
      currentTurnPlayer: true,
    },
  });

  if (game === undefined) throw new Error("Unable to find game");

  let territoryStates: TerritoryState[] = [];
  let historicalEvents: HistoricalEvent[] = [];

  if (game!.currentTurn <= startAt) {
  }

  const currentPlayer = {
    name: game!.currentTurnPlayer!.name,
    displayName:
      game!.currentTurnPlayer!.displayName ?? game!.currentTurnPlayer!.name,
  };

  return [
    currentPlayer,
    game!.currentTurn,
    game!.currentTurnStep,
    territoryStates,
    historicalEvents,
  ];
}

async function saveGameEvent(gameId: string, historicalEvent: HistoricalEvent) {
  const playerForEventId = await findPlayerIdForName(
    historicalEvent.playerTurn
  );
  const postEventPlayerId = await findPlayerIdForName(
    historicalEvent.mewPlayerRoundStep
  );

  const newSelectedTerritory = await findTerritoryIdForName(
    historicalEvent.newSelectedTerritory
  );

  const newEventDetailsToCreate = (
    await Promise.all(
      historicalEvent.details.map(async (rec) => {
        const selectedTerritory = {
          type: "Selected",
          territoryId: await findTerritoryIdForName(rec.selectedTerritoryName),
          playerId: await findPlayerIdForName(rec.selectedTerritoryNewOwner),
          armies: rec.selectedTerritoryNewArmies,
        };

        if (
          selectedTerritory.territoryId === undefined ||
          selectedTerritory.playerId === undefined
        )
          new Error("unable to locate data of some kind");

        if (
          !rec.targetTerritoryName ||
          !rec.targetTerritoryNewOwner ||
          !rec.targetTerritoryNewArmies
        )
          return [selectedTerritory];

        const targetTerritory = {
          type: "Target",
          territoryId: await findTerritoryIdForName(rec.targetTerritoryName),
          playerId: await findPlayerIdForName(rec.targetTerritoryNewOwner),
          armies: rec.targetTerritoryNewArmies,
        };

        if (
          targetTerritory.territoryId === undefined ||
          selectedTerritory.playerId === undefined
        )
          new Error("unable to locate data of some kind");

        return [selectedTerritory, targetTerritory] as {
          type: string;
          territoryId: string;
          playerId: string;
          armies: number;
        }[];
      })
    )
  ).flatMap((x) => x);

  if (playerForEventId === undefined || postEventPlayerId === undefined)
    throw new Error("unable to locate user");

  await prisma.gameRecord.update({
    where: {
      id: gameId,
    },
    data: {
      currentTurnPlayerId: postEventPlayerId,
      currentTurn: historicalEvent.roundCount,
      currentTurnStep: historicalEvent.mewPlayerRoundStep,
    },
  });

  const ev = await prisma.gameEventRecord.create({
    data: {
      gameId: gameId,
      humanReadableDescription: historicalEvent.humanReadableDescription,
      newRoundStep: historicalEvent.mewPlayerRoundStep,
      roundCounter: historicalEvent.roundCount,
      roundStep: historicalEvent.roundStep,
      playerForEventId: playerForEventId,
      postEventPlayerId: postEventPlayerId,
      newSelectedTerritoryId: newSelectedTerritory,
    },
  });

  if (newEventDetailsToCreate.length === 0) return;

  for (const ev of newEventDetailsToCreate) {
    await prisma.gameTerritoryStateRecord.updateMany({
      where: {
        AND: {
          territoryId: ev.territoryId,
          gameId: gameId,
        },
      },
      data: {
        armies: ev.armies,
        ownerId: ev.playerId,
      },
    });
  }

  await prisma.gameEventDetail.createMany({
    data: newEventDetailsToCreate.map((det) => ({
      gameEventId: ev.id,
      territoryType: det.type,
      territoryId: det.territoryId ?? "", // this shouldn't be possible
      armiesPostEvent: det.armies,
      territoryPostEventOwnerId: det.playerId ?? "", // this shouldn't be possible
    })),
  });
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
  saveGameEvent,
  getGameEvents,
};

export default PersistanceService;
