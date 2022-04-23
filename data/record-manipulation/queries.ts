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
