import { Decimal } from "@prisma/client/runtime";
import GameMap, {
  Continent,
  Territory,
  TerritoryBridge,
  TerritoryPathDefinition,
  toContinentNameKey,
  toCountryNameKey,
} from "../models/GameMap";
import { GameSummary, toRoundStepType } from "../models/GameState";

export function mapQueryResultToGameMap(availableMaps: {
  name: string;
  id: string;
  continents: {
    name: string;
    displayName: string;
    bonusValue: number;
    territories: {
      name: string;
      pathDef: string;
      displayText: string;
      textBoxHeight: Decimal;
      textBoxWidth: Decimal;
      textBoxX: Decimal;
      textBoxY: Decimal;
      territoryDestinations: { territoryDestination: { name: string } }[];
    }[];
  }[];
}) {
  const continents: Continent[] = availableMaps.continents.map((con) => ({
    name: toContinentNameKey(con.name),
    displayName: con.displayName,
    bonusValue: con.bonusValue,
  }));
  const territories: Territory[] = availableMaps.continents.flatMap((con) =>
    con.territories.map((primaryTerritory) => ({
      name: toCountryNameKey(primaryTerritory.name),
      continentName: toContinentNameKey(con.name),
      displayText: primaryTerritory.displayText,
      value: 0,
    }))
  );
  const territoryBridges: TerritoryBridge[] = availableMaps.continents
    .flatMap((con) =>
      con.territories.flatMap((primaryTerritory) =>
        primaryTerritory.territoryDestinations.map((secondary) => ({
          prim: primaryTerritory.name,
          sec: secondary.territoryDestination.name,
        }))
      )
    )
    .map((x) => [x.prim, x.sec]);
  const territoryPathDefinitions: TerritoryPathDefinition[] =
    availableMaps.continents.flatMap((con) =>
      con.territories.map((primaryTerritory) => ({
        name: toCountryNameKey(primaryTerritory.name),
        pathDef: primaryTerritory.pathDef,
        textBoxX: primaryTerritory.textBoxX.toNumber(),
        textBoxY: primaryTerritory.textBoxY.toNumber(),
        textBoxWidth: primaryTerritory.textBoxWidth.toNumber(),
        textBoxHeight: primaryTerritory.textBoxHeight.toNumber(),
      }))
    );
  const map: GameMap = {
    continents,
    territories,
    territoryBridges,
    territoryPathDefinitions,
  };

  return map;
}

export function mapQueryResultToTerritoryState(state: {
  armies: number;
  territory: { name: string };
  owner: { name: string };
}) {
  return {
    armies: state.armies,
    territoryName: state.territory.name,
    playerName: state.owner.name,
  };
}

export function mapQueryResultToGameSummary(availableMaps: {
  id: string;
  currentTurnStep: string;
  currentTurn: number;
  winner: { name: string; displayName: string | null } | null;
  currentTurnPlayer: { name: string; displayName: string | null  } | null;
  player1: { name: string; displayName: string | null  };
  player2: { name: string; displayName: string | null  };
  map: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
}): GameSummary {
  return {
    id: availableMaps.id,
    currentTurnCount: availableMaps.currentTurn,
    currentTurnStep: toRoundStepType(availableMaps.currentTurnStep),
    map: {
      id: availableMaps.map.id,
      name: availableMaps.map.name,
    },
    player1: {
      name: availableMaps.player1.name,
      displayName: availableMaps.player1.displayName ?? availableMaps.player1.name,
    },
    player2: {
      name: availableMaps.player2.name,
      displayName: availableMaps.player2.displayName ?? availableMaps.player2.name,
    },
    startDate: availableMaps.createdAt.toUTCString(),
    updatedDate: availableMaps.updatedAt.toUTCString(),
  };
}
