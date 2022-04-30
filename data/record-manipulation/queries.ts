export const getGameStateSelectQueryDefinition = {
  armies: true,
  owner: {
    select: {
      name: true,
    },
  },
  territory: {
    select: {
      name: true,
    },
  },
};

export const gameSummarySelectQueryDefinition = {
  id: true,
  currentTurnStep: true,
  currentTurn: true,
  winner: {
    select: {
      name: true,
      displayName: true,
    },
  },
  player1: {
    select: {
      name: true,
      displayName: true,
    },
  },
  player2: {
    select: {
      name: true,
      displayName: true,
    },
  },
  currentTurnPlayer: {
    select: {
      name: true,
      displayName: true,
    },
  },
  map: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
};

export const mapContentSelectQuery = {
  name: true,
  id: true,
  continents: {
    select: {
      name: true,
      displayName: true,
      bonusValue: true,
      territories: {
        select: {
          name: true,
          pathDef: true,
          displayText: true,
          textBoxHeight: true,
          textBoxWidth: true,
          textBoxX: true,
          textBoxY: true,
          territoryDestinations: {
            select: {
              territoryDestination: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
};

export const recentEventWhereClause = (gameId: string, startAt: number) => ({
  AND: {
    gameId: gameId,
    roundCounter: {
      gt: startAt,
    },
  },
});

export const recentEventSelectClause = {
  postEventPlayer: {
    select: {
      name: true,
      displayName: true,
    },
  },
  playerForEvent: {
    select: {
      name: true,
      displayName: true,
    },
  },
  newSelectedTerritory: {
    select: {
      name: true,
    },
  },
  postEventWinningPlayer: {
    select: {
      name: true,
    },
  },
  newRoundStep: true,
  roundCounter: true,
  humanReadableDescription: true,
  roundStep: true,
  details: {
    select: {
      territory: { select: { name: true } },
      armiesPostEvent: true,
      territoryType: true,
      territoryPostEventOwner: {
        select: {
          name: true,
          displayName: true,
        },
      },
    },
  },
};

export const gameSummaryForUserSelectQuery = (
  userName: string,
  includeCompletedGames: boolean
) => ({
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
    includeCompletedGames
      ? {}
      : {
          NOT: {
            currentTurnStep: "GameOver",
          },
        },
  ],
});

export const potentialOpponentsForPlayerWhereClause = (playerName: string) => ({
  NOT: {
    name: playerName,
  },
});
