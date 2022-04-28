import { rollBattleDice } from "../../utilities/Randomization";
import { CountryNameKey } from "../models/GameMap";
import { TerritoryState } from "../models/GameState";

export function executeArmyMovementAgainstTerritoryStates(
  currentPositions: TerritoryState[],
  selectedTerritory: CountryNameKey,
  targetTerritory: CountryNameKey,
  selectedArmies: number
): [string, TerritoryState[]] {
  let positions = currentPositions;

  let selectedTerritoryState = positions.find(
    (x) => x.territoryName === selectedTerritory
  );
  let targetTerritoryState = positions.find(
    (x) => x.territoryName === targetTerritory
  );

  let updatedSelectedTerritoryState;
  let updatedTargetTerritoryState;

  let whatHappened = "";

  if (
    selectedTerritoryState === undefined ||
    targetTerritoryState === undefined
  )
    return [whatHappened, positions];

  if (selectedTerritoryState.playerName === targetTerritoryState.playerName) {
    // If the tile has the same owner just move the armies.
    updatedSelectedTerritoryState = {
      ...selectedTerritoryState,
      armies: selectedTerritoryState.armies - selectedArmies,
    };
    updatedTargetTerritoryState = {
      ...targetTerritoryState,
      armies: targetTerritoryState.armies + selectedArmies,
    };

    whatHappened = `${updatedSelectedTerritoryState.playerName} is moving ${selectedArmies} armies from ${selectedTerritory} to ${targetTerritory}.`;
  } else {
    // If the tiles have different owners it is an attack.
    let [survivingAttackers, survivingDefenders] = rollBattleDice(
      selectedArmies,
      targetTerritoryState.armies
    );

    ({
      updatedSelectedTerritoryState,
      updatedTargetTerritoryState,
      whatHappened,
    } = applyAttackResults(
      survivingDefenders,
      updatedSelectedTerritoryState,
      selectedTerritoryState,
      selectedArmies,
      updatedTargetTerritoryState,
      targetTerritoryState,
      survivingAttackers,
      whatHappened,
      selectedTerritory,
      targetTerritory
    ));
  }

  let updatedPositions = positions.filter(
    (x) =>
      x.territoryName !== targetTerritory &&
      x.territoryName !== selectedTerritory
  );
  updatedPositions.push(updatedSelectedTerritoryState);
  updatedPositions.push(updatedTargetTerritoryState);

  return [whatHappened, updatedPositions];
}

function applyAttackResults(
  survivingDefenders: number,
  updatedSelectedTerritoryState: any,
  selectedTerritoryState: TerritoryState,
  selectedArmies: number,
  updatedTargetTerritoryState: any,
  targetTerritoryState: TerritoryState,
  survivingAttackers: number,
  whatHappened: string,
  selectedTerritory: string,
  targetTerritory: string
) {
  if (survivingDefenders === 0) {
    updatedSelectedTerritoryState = {
      ...selectedTerritoryState,
      armies: selectedTerritoryState.armies - selectedArmies,
    };
    updatedTargetTerritoryState = {
      ...targetTerritoryState,
      armies: survivingAttackers,
      playerName: selectedTerritoryState.playerName,
    };
  } else {
    const deadAttackers = selectedArmies - survivingAttackers;
    updatedSelectedTerritoryState = {
      ...selectedTerritoryState,
      armies: selectedTerritoryState.armies - deadAttackers,
    };
    updatedTargetTerritoryState = {
      ...targetTerritoryState,
      armies: survivingDefenders,
    };
  }

  whatHappened = `${
    updatedSelectedTerritoryState.playerName
  } is attacking with ${selectedArmies} armies from ${selectedTerritory} to ${targetTerritory}.
                           - ${
                             survivingDefenders === 0
                               ? selectedTerritoryState.playerName
                               : targetTerritoryState.playerName
                           } won.
                           - survivingAttackers: ${survivingAttackers}, survivingDefenders: ${survivingDefenders}`;
  return {
    updatedSelectedTerritoryState,
    updatedTargetTerritoryState,
    whatHappened,
  };
}

export function addArmiesToTile(
  currentPositions: TerritoryState[],
  targetTerritory: CountryNameKey,
  selectedArmies: number
): [string, TerritoryState[]] {
  let positions = currentPositions;

  let targetTerritoryState = positions.find(
    (x) => x.territoryName === targetTerritory
  );

  let updatedTargetTerritoryState;

  let whatHappened = "";

  if (targetTerritoryState === undefined) return [whatHappened, positions];

  updatedTargetTerritoryState = {
    ...targetTerritoryState,
    armies: targetTerritoryState.armies + selectedArmies,
  };

  whatHappened = `${targetTerritoryState.playerName} is adding ${selectedArmies} armies to ${targetTerritory}.`;

  let updatedPositions = positions.filter(
    (x) => x.territoryName !== targetTerritory
  );
  updatedPositions.push(updatedTargetTerritoryState);

  return [whatHappened, updatedPositions];
}
