import { FailureReport, RecentGameEventResponse } from "../models/Dtos";
import GameMap, { CountryNameKey } from "../models/GameMap";
import {
  HistoricalEvent,
  HistoricalEventDetailItem,
  RoundStepType,
  TerritoryState,
} from "../models/GameState";
import Player from "../models/Player";
import {
  getCountryForTerritory as getContinentForTerritory,
  getTerritoryStateFromContext,
} from "../models/Selectors";
import {
  addArmiesToTile,
  executeArmyMovementAgainstTerritoryStates,
} from "./UserActions";

export type ArmyApplicationSet = {
  playerName: string;
  numberOfArmiesRemaining: number;
};

export interface IWorldMapState {
  singleScreenPlay: boolean;
  gameId: string;
  currentMap: GameMap;
  currentPlayers: [Player, Player];
  currentTurn: string;
  currentPositions: TerritoryState[];
  selectedTerritory: CountryNameKey | undefined;
  detailRequestedTerritory: CountryNameKey | undefined;
  history: string;
  roundStep: RoundStepType;
  roundStepRemainingPlayerTurns: string[];
  armiesToApply: ArmyApplicationSet[];
  roundCounter: number;
  errorMessage: string;
  winner: string | undefined;
}

export interface IWorldMapAction {
  type:
    | "None"
    | "SelectTile"
    | "TargetTile"
    | "ClearSelection"
    | "LoadInitialState"
    | "MoveToNextStep"
    | "ShowDetail"
    | "ToggleSimpleScreenPlay";
  target?: CountryNameKey;
  armiesToApply?: number;
  initialState?: IWorldMapState;
}

function buildStateHistoryTupleFromStates(
  previousState: IWorldMapState,
  newState: IWorldMapState,
  humanReadableDescription: string,
  details: HistoricalEventDetailItem[]
): [IWorldMapState, HistoricalEvent] {
  const historyItem1: HistoricalEvent = {
    playerTurn: previousState.currentTurn,
    roundCount: previousState.roundCounter,
    newPlayerTurn: newState.currentTurn,
    mewPlayerRoundStep: newState.roundStep,
    newSelectedTerritory: newState.selectedTerritory,
    winner: newState.winner,
    details: details,
    humanReadableDescription: humanReadableDescription,
    roundStep: previousState.roundStep,
  };
  return [newState, historyItem1];
}

export function applyMovementToStateAndGetHistoryDto(
  state: IWorldMapState,
  action: IWorldMapAction
): [IWorldMapState, HistoricalEvent | undefined] {
  switch (action.type) {
    case "ToggleSimpleScreenPlay":
      return buildStateHistoryTupleFromStates(
        state,
        {
          ...state,
          singleScreenPlay: !state.singleScreenPlay,
        },
        "",
        []
      );
    case "MoveToNextStep":
      return buildStateHistoryTupleFromStates(
        state,
        moveToNextTurn(state),
        "",
        []
      );
    case "LoadInitialState":
      return buildStateHistoryTupleFromStates(
        state,
        action.initialState ?? state,
        "",
        []
      );
    case "ClearSelection":
      let newHistory = appendEventToHistory(
        state.roundCounter,
        `${state.currentTurn} - Cleared Selection`,
        state.history
      );
      const newStateCs = {
        ...state,
        roundCounter: state.roundCounter + 1,
        history: newHistory,
        selectedTerritory: undefined,
        detailRequestedTerritory: undefined,
      };
      return buildStateHistoryTupleFromStates(
        state,
        newStateCs,
        newHistory,
        []
      );
    case "SelectTile":
      const selectedTerritoryDetail = state.currentPositions.find(
        (x) => x.territoryName === action.target
      );
      if (
        !state.selectedTerritory &&
        action.target &&
        selectedTerritoryDetail
      ) {
        let newHistory = appendEventToHistory(
          state.roundCounter,
          `${state.currentTurn} - Selected ${action.target}`,
          state.history
        );
        const newStateSt = {
          ...state,
          roundCounter: state.roundCounter + 1,
          history: newHistory,
          selectedTerritory: action.target,
        };
        const detailItem: HistoricalEventDetailItem = {
          selectedTerritoryName: action.target,
          selectedTerritoryNewOwner: state.currentTurn,
          selectedTerritoryNewArmies: selectedTerritoryDetail.armies,
          targetTerritoryName: undefined,
          targetTerritoryNewOwner: undefined,
          targetTerritoryNewArmies: undefined,
        };
        return buildStateHistoryTupleFromStates(state, newStateSt, newHistory, [
          detailItem,
        ]);
      }
    case "ShowDetail":
      let newHistoryForDetailReq = appendEventToHistory(
        state.roundCounter,
        `${state.currentTurn} - Requested detail for ${action.target}`,
        state.history
      );
      return [
        {
          ...state,
          roundCounter: state.roundCounter + 1,
          history: newHistoryForDetailReq,
          detailRequestedTerritory: action.target,
        },
        undefined,
      ];
    case "TargetTile":
      if (!action.armiesToApply || !action.target) return [state, undefined];

      if (state.selectedTerritory === undefined) {
        return performAddArmies(state, action.target, action.armiesToApply);
      }

      return performAttackOrMove(
        state,
        state.selectedTerritory,
        action.target,
        action.armiesToApply
      );
  }
  return [state, undefined];
}

function appendEventToHistory(
  round: number,
  nextEvent: string,
  previousHistory: string
) {
  let date = new Date(Date.now()).toISOString();
  return `${round.toString()}\t${date}\t${nextEvent}`;
}

function moveToNextTurn(state: IWorldMapState): IWorldMapState {
  if (
    state.roundStepRemainingPlayerTurns &&
    state.roundStepRemainingPlayerTurns.length
  ) {
    const nextPlayer = state.roundStepRemainingPlayerTurns[0];
    const remainingSteps = state.roundStepRemainingPlayerTurns.slice(1);
    return {
      ...state,
      selectedTerritory: undefined,
      detailRequestedTerritory: undefined,
      currentTurn: nextPlayer,
      roundStepRemainingPlayerTurns: remainingSteps,
    };
  }

  const newStep =
    state.roundStep === "Movement"
      ? "AddArmies"
      : state.roundStep === "AddArmies"
      ? "Attack"
      : "Movement";
  const newArmyValue: ArmyApplicationSet[] = calculateNewArmiesToAdd(
    newStep,
    state
  );
  const stepReset = state.currentPlayers.map((x) => x.name);
  const newRoundCounter = state.roundCounter + 1;
  const newCurrentTurn = stepReset[0];
  const newRoundStepRemainingPlayerTurns = stepReset.slice(1);

  return {
    ...state,
    currentTurn: newCurrentTurn,
    roundStep: newStep,
    roundStepRemainingPlayerTurns: newRoundStepRemainingPlayerTurns,
    roundCounter: newRoundCounter,
    armiesToApply: newArmyValue,
  };
}

function calculateNewArmiesToAdd(
  newStep: string,
  state: IWorldMapState
): ArmyApplicationSet[] {
  if (newStep === "AddArmies") {
    const numberOfTerritoriesControlled =
      calculatePlayerControlledTerritoryCountBonus(state);
    const continentOwners = calculateContinentOwnershipBonuses(state);

    return state.currentPlayers.map((x) => {
      const cBonus =
        continentOwners.find((y) => y.playerName === x.name)?.armiesToAdd ?? 0;
      const tBonus =
        numberOfTerritoriesControlled.find((y) => y.playerName === x.name)
          ?.armiesToAdd ?? 0;
      const previousValue =
        state.armiesToApply.find((y) => y.playerName === x.name)
          ?.numberOfArmiesRemaining ?? 0;

      return {
        playerName: x.name,
        numberOfArmiesRemaining: cBonus + tBonus + previousValue,
      };
    });
  }

  return state.armiesToApply;
}

function calculateContinentOwnershipBonuses(state: IWorldMapState) {
  return Array.from(
    state.currentPositions
      .map((x) => {
        return {
          playerName: x.playerName,
          continent: getContinentForTerritory(
            state.currentMap,
            x.territoryName
          ),
        };
      })
      .reduce((previousValue, newValue) => {
        if (
          newValue &&
          previousValue &&
          newValue.continent &&
          newValue.playerName
        ) {
          let prevValue = previousValue.get(newValue.continent.name) ?? [];
          if (prevValue.find((x) => x === newValue.playerName) === undefined) {
            prevValue.push(newValue.playerName);
          }
          previousValue.set(newValue.continent.name, prevValue);
          return previousValue;
        }
        return previousValue;
      }, new Map<string, string[]>())
      .entries()
  )
    .filter((x) => x[1].length === 1)
    .map((x) => {
      const continentValue =
        state.currentMap.continents.find((y) => y.name === x[0])?.bonusValue ??
        0;
      return { playerName: x[1][0], armiesToAdd: continentValue };
    });
}

function calculatePlayerControlledTerritoryCountBonus(state: IWorldMapState) {
  return Array.from(
    state.currentPositions
      .map((x) => x.playerName)
      .reduce((previousValue, newValue) => {
        if (newValue && previousValue) {
          previousValue.set(newValue, (previousValue.get(newValue) ?? 0) + 1);
          return previousValue;
        }
        return previousValue;
      }, new Map<string, number>())
      .entries()
  ).map((x) => {
    const territoryValueBonus = Math.floor(x[1] / 3);
    return { playerName: x[0], armiesToAdd: territoryValueBonus };
  });
}

function performAttackOrMove(
  state: IWorldMapState,
  selectedTerritory: CountryNameKey,
  target: CountryNameKey,
  armiesToApply: number
): [IWorldMapState, HistoricalEvent] {
  let [update, updatedPositions] = executeArmyMovementAgainstTerritoryStates(
    state.currentPositions,
    selectedTerritory,
    target,
    armiesToApply
  );

  const targetFromTerritoryDetail = updatedPositions.find(
    (x) => x.territoryName === selectedTerritory
  );

  const targetToTerritoryDetail = updatedPositions.find(
    (x) => x.territoryName === target
  );

  const detailItem: HistoricalEventDetailItem = {
    selectedTerritoryName: targetFromTerritoryDetail!.territoryName,
    selectedTerritoryNewOwner: targetFromTerritoryDetail!.playerName!,
    selectedTerritoryNewArmies: targetFromTerritoryDetail!.armies,
    targetTerritoryName: targetToTerritoryDetail!.territoryName,
    targetTerritoryNewOwner: targetToTerritoryDetail!.playerName!,
    targetTerritoryNewArmies: targetToTerritoryDetail!.armies,
  };

  let updatedHistory = appendEventToHistory(
    state.roundCounter,
    update,
    state.history
  );

  const remainingPlayers = Array.from(
    new Set(updatedPositions.map((x) => x.playerName))
  );

  const baseState =
    remainingPlayers.length === 1
      ? {
          ...state,
          roundStep: "GameOver",
          winner: remainingPlayers[0]!,
        }
      : state.roundStep === "Movement"
      ? moveToNextTurn(state)
      : state;
  const newState = {
    ...baseState,
    currentPositions: updatedPositions,
    selectedTerritory: undefined,
    detailRequestedTerritory: undefined,
    history: updatedHistory,
  };

  return buildStateHistoryTupleFromStates(state, newState, updatedHistory, [
    detailItem,
  ]);
}

function performAddArmies(
  state: IWorldMapState,
  target: CountryNameKey,
  armiesToApply: number
): [IWorldMapState, HistoricalEvent | undefined] {
  let remainingArmiesAfterAdd: number =
    (state.armiesToApply.find((x) => x.playerName === state.currentTurn)
      ?.numberOfArmiesRemaining ?? 0) - armiesToApply;

  if (remainingArmiesAfterAdd < 0) {
    return [
      {
        ...state,
        history: appendEventToHistory(
          state.roundCounter,
          `${state.currentPlayers} has ${remainingArmiesAfterAdd} armies remaining to apply.`,
          state.history
        ),
      },
      undefined,
    ];
  }

  let [update, updatedPositions] = addArmiesToTile(
    state.currentPositions,
    target,
    armiesToApply
  );

  const targetFromTerritoryDetail = updatedPositions.find(
    (x) => x.territoryName === target
  );

  const detailItem: HistoricalEventDetailItem = {
    selectedTerritoryName: targetFromTerritoryDetail!.territoryName,
    selectedTerritoryNewOwner: targetFromTerritoryDetail!.playerName!,
    selectedTerritoryNewArmies: targetFromTerritoryDetail!.armies,
    targetTerritoryName: undefined,
    targetTerritoryNewOwner: undefined,
    targetTerritoryNewArmies: undefined,
  };

  let updatedHistory = appendEventToHistory(
    state.roundCounter,
    update,
    state.history
  );

  updatedHistory = appendEventToHistory(
    state.roundCounter,
    `${state.currentTurn} has ${remainingArmiesAfterAdd} armies remaining to apply.`,
    updatedHistory
  );

  const remainingArmies = state.armiesToApply.map((x) =>
    x.playerName === state.currentTurn
      ? {
          playerName: x.playerName,
          numberOfArmiesRemaining: remainingArmiesAfterAdd,
        }
      : x
  );

  const shouldMoveToNextTurn = remainingArmiesAfterAdd === 0;

  const baseStateForReturn = shouldMoveToNextTurn
    ? moveToNextTurn(state)
    : state;

  const newState = {
    ...baseStateForReturn,
    roundCounter: state.roundCounter + 1,
    currentPositions: updatedPositions,
    selectedTerritory: undefined,
    history: updatedHistory,
    armiesToApply: remainingArmies,
  };

  return buildStateHistoryTupleFromStates(state, newState, updatedHistory, [
    detailItem,
  ]);
}

const mergePositions = (
  previousPositions: TerritoryState[],
  updatedTerritoryStates: TerritoryState[]
) =>
  previousPositions.map(
    (prev) =>
      updatedTerritoryStates.find(
        (x) => x.territoryName === prev.territoryName
      ) ?? prev
  );

export const applyNewEventsToState = (
  state: IWorldMapState,
  newEvents: RecentGameEventResponse | FailureReport
) => {
  if (
    newEvents.type === "RecentGameEventResponse" &&
    newEvents.currentRoundCounter > state.roundCounter
  ) {
    const winner = newEvents.eventDetails
      .filter((x) => x.winner)
      .map((x) => x.winner);
    const newState: IWorldMapState = {
      ...state,
      currentTurn: newEvents.currentPlayerTurn?.name ?? state.currentTurn,
      roundCounter: newEvents.currentRoundCounter,
      roundStep: newEvents.currentTurnRoundStep,
      winner: winner.length > 0 ? winner[0] : undefined,
      currentPositions: mergePositions(
        state.currentPositions,
        newEvents.updatedTerritoryStates
      ),
    };

    return newState;
  }

  return state;
};
