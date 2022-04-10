import { DefaultButton, IStackTokens, Label, ScrollablePane, Stack, TextField } from "@fluentui/react";
import { useContext, useEffect, useReducer } from "react";
import {
  GameContext,
  IGameContext,
  ITileContext,
  WorldMapContext,
} from "../data/models/Contexts";
import { CountryNameKey } from "../data/models/GameMap";
import {
  IWorldMapState,
  worldMapReducer,
} from "../data/services/WorldStateTransformers";
import { NamedTerritoryTile } from "./TerritoryTile";

import WorldMapControlPanel from "./WorldMapControlPanel";

const WorldMap = () => {
  let gameContext = useContext<IGameContext>(GameContext);
  const initialState: IWorldMapState = {
    currentMap: gameContext.currentMap,
    currentPlayers: gameContext.currentPlayers,
    currentTurn: gameContext.currentPlayers[0].name,
    currentPositions: gameContext.currentPositions,
    selectedTerritory: undefined,
    history: "Game Started",
    roundStep: "Attack",
    roundStepRemainingPlayerTurns: gameContext.currentPlayers
      .map((x) => x.name)
      .slice(1),
    armiesToApply: [],
    roundCounter: 0,
  };

  let [state, dispatch] = useReducer(worldMapReducer, initialState);

  useEffect(() => {
    dispatch({ type: "LoadInitialState", initialState: initialState });
  }, [gameContext]);

  let applyArmies = (name: CountryNameKey, selectedArmies: number) => {
    dispatch({
      type: "TargetTile",
      armiesToApply: selectedArmies,
      target: name,
    });
  };

  let trySelectTerritory = (name: CountryNameKey) => {
    dispatch({ type: "SelectTile", target: name });
  };

  let propsToAddToEachTile: ITileContext = {
    ...gameContext,
    currentPositions: state.currentPositions,
    currentTurn: state.currentTurn,
    selectedTerritory: state.selectedTerritory,
    roundStep: state.roundStep,
    onClick: trySelectTerritory,
    applyArmies: applyArmies,
    currentTurnOutstandingArmies:
      state.armiesToApply.find((x) => x.playerName === state.currentTurn)
        ?.numberOfArmiesRemaining ?? 0,
  };

  let clearSelectedTerritory = () => {
    dispatch({ type: "ClearSelection" });
  };

  let moveNextStep = () => {
    dispatch({ type: "MoveToNextStep" });
  };

  const stackTokens: IStackTokens = { childrenGap: 40 };
  
  return (
    <WorldMapContext.Provider value={propsToAddToEachTile}>
      <Stack  className="gamePanel">
          <svg viewBox="0 40 210 160">
            {gameContext.currentMap.territories.map((x) => (
              <NamedTerritoryTile name={x.name} />
            ))}
          </svg>
        <Stack className="bottomControlPanel">
          
          <Stack horizontal  tokens={stackTokens}>
            <Label
              className={
                state.roundStep !== "AddArmies"
                  ? "progressNavbarOff"
                  : "progressNavbarOn"
              }
            >
              Planning Phase
            </Label>
            <Label
              className={
                state.roundStep !== "Attack"
                  ? "progressNavbarOff"
                  : "progressNavbarOn"
              }
            >
              Attack Phase
            </Label>
            <Label
              className={
                state.roundStep !== "Movement"
                  ? "progressNavbarOff"
                  : "progressNavbarOn"
              }
            >
              Reallocate Phase
            </Label>
            <DefaultButton onClick={moveNextStep}>End Turn</DefaultButton>
          </Stack>
          <Stack horizontal horizontalAlign="stretch"  tokens={stackTokens}>
            <div
              style={{
                padding:"1erm",
                flex:1,
                flexGrow:0.3
              }}
            >
              <WorldMapControlPanel
                selectedTerritory={state.selectedTerritory}
                clearSelectedTerritory={clearSelectedTerritory}
              />
            </div>
            <div style={{flex:4, flexGrow:1}}>
              <h5>Event Log</h5>
              <TextField multiline value={state.history} />
            </div>
          </Stack>
        </Stack>
      </Stack>
    </WorldMapContext.Provider>
  );
};

export default WorldMap;
