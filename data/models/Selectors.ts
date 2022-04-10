import { ITerritoryProps } from "../../components/TerritoryTile";
import { IGameContext, ITileContext } from "./Contexts";
import GameMap, {
  Continent,
  ContinentNameKey,
  CountryNameKey,
  Territory,
  TerritoryPathDefinition,
  TerritoryPotentialActions,
} from "./GameMap";
import { TerritoryState } from "./GameState";

function getTerritoryFromContext(gameMap: GameMap, name: string): Territory | undefined {
  return gameMap.territories.find((x) => x.name === name);
}

function getContinentFromContext(gameMap: GameMap, name: ContinentNameKey): Continent | undefined {
  return gameMap.continents.find((x) => x.name === name);
}

export function getCountryForTerritory(gameMap: GameMap, territoryName: string): Continent | undefined {
  const terr = getTerritoryFromContext(gameMap, territoryName);
  if (!terr) return undefined;
  return getContinentFromContext(gameMap, terr.continentName);
}

export function getTerritoryStateFromContext(context: IGameContext, name: CountryNameKey): TerritoryState | undefined {
  return context.currentPositions.find((x) => x.territoryName === name);
}

export function getTerritoryPathDefinitionFromContext(
  context: IGameContext,
  name: string
): TerritoryPathDefinition | undefined {
  return context.currentMap.territoryPathDefinitions.find((x) => x.name === name);
}

export function getPlayerIndexForNameFromContext(context: IGameContext, name: string): number {
  return context.currentPlayers.findIndex((x) => x.name === name) ?? 0;
}

export function getPlayerIndexForTerritoryFromContext(context: IGameContext, territoryName: CountryNameKey): number {
  let territory = getTerritoryStateFromContext(context, territoryName);

  if (territory === undefined) return 0;

  return context.currentPlayers.findIndex((x) => x.name === territory?.playerName) ?? 0;
}

export function getPotentialActionsForTerritory(
  context: IGameContext,
  territoryName: CountryNameKey
): TerritoryPotentialActions {
  let territoryState = getTerritoryStateFromContext(context, territoryName);

  if (territoryState === undefined) return "None";

  if (context.roundStep === "AddArmies") {
    if (context.selectedTerritory === undefined && territoryState.playerName === context.currentTurn) {
      return "AddArmies";
    } else return "None";
  }

  if (
    territoryState.playerName === context.currentTurn &&
    territoryState.armies > 1 &&
    context.selectedTerritory === undefined
  )
    return "Select";

  if (
    context.currentMap.territoryBridges.find((x) => x[0] === context.selectedTerritory && x[1] === territoryName) !==
    undefined
  ) {
    if (
      territoryState.playerName !== context.currentTurn &&
      context.selectedTerritory !== undefined &&
      context.roundStep === "Attack"
    )
      return "Attack";
    if (
      territoryState.playerName === context.currentTurn &&
      context.selectedTerritory !== undefined &&
      context.roundStep === "Movement"
    )
      return "Move";
  }
  return "None";
}

export function buildTerritoryPropsForTile(context: ITileContext, name: CountryNameKey): ITerritoryProps | string {
  let worldMapContext = context;

  const territory: Territory | undefined = getTerritoryFromContext(worldMapContext.currentMap, name);

  if (territory === undefined) {
    return `ERROR WHAT IS ${name}`;
  }

  const continent: Continent | undefined = getContinentFromContext(worldMapContext.currentMap, territory.continentName);

  if (continent === undefined) {
    return `ERROR WHAT IS ${territory.continentName}`;
  }

  const territoryPath: TerritoryPathDefinition | undefined = getTerritoryPathDefinitionFromContext(
    worldMapContext,
    name
  );

  if (territoryPath === undefined) {
    return `WHERE IS ${name}`;
  }

  const territoryState: TerritoryState | undefined = getTerritoryStateFromContext(worldMapContext, name);

  let ownerPlayerIndex = getPlayerIndexForTerritoryFromContext(worldMapContext, name);
  let actions = getPotentialActionsForTerritory(worldMapContext, name);
  let isSelected = name === worldMapContext.selectedTerritory;

  let [, selectedTerritoryState] = getSelectedTerritory(worldMapContext) ?? [undefined, undefined];

  let remainingArmiesToAdd = context.currentTurnOutstandingArmies;
  let possibleArmiesToApply =
    actions === "AddArmies"
      ? remainingArmiesToAdd
      : selectedTerritoryState === undefined
      ? 0
      : selectedTerritoryState?.armies - 1 ?? 0;

  let props: ITerritoryProps = {
    continent: continent,
    territory: territory,
    possibleArmiesToApply: possibleArmiesToApply,
    armies: territoryState?.armies ?? 0,
    potentialActions: actions,
    isTerritorySelected: isSelected,
    pathDefinition: territoryPath,
    ownerIndex: ownerPlayerIndex,
    select: () => worldMapContext.onClick(name),
    applyArmy: (selectedArmies) => worldMapContext.applyArmies(name, selectedArmies),
  };
  return props;
}

function getSelectedTerritory(worldMapContext: ITileContext): [Territory | undefined, TerritoryState | undefined] {
  if (worldMapContext.selectedTerritory === undefined) return [undefined, undefined];

  var territory = getTerritoryFromContext(worldMapContext.currentMap, worldMapContext.selectedTerritory);
  var territoryState = getTerritoryStateFromContext(worldMapContext, worldMapContext.selectedTerritory);

  return [territory, territoryState];
}
