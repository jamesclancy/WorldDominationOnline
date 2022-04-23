import { useContext, useEffect, useReducer } from "react";
import {
  Button,
  Col,
  Container,
  Form,
  Nav,
  Navbar,
  NavDropdown,
  Row,
} from "react-bootstrap";
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
    detailRequestedTerritory: undefined,
  };

  let [state, dispatch] = useReducer(worldMapReducer, initialState);

  useEffect(() => {
    const loadedState: IWorldMapState = {
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
      detailRequestedTerritory: undefined,
    };
    dispatch({ type: "LoadInitialState", initialState: loadedState });
  }, [gameContext]);

  let applyArmies = (name: CountryNameKey, selectedArmies: number) => {
    dispatch({
      type: "TargetTile",
      armiesToApply: selectedArmies,
      target: name,
    });
  };

  let showDetail = (name: CountryNameKey | undefined) => {
    dispatch({
      type: "ShowDetail",
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
    detailRequestedTerritory: state.detailRequestedTerritory,
    roundStep: state.roundStep,
    onSelect: trySelectTerritory,
    applyArmies: applyArmies,
    currentTurnOutstandingArmies:
      state.armiesToApply.find((x) => x.playerName === state.currentTurn)
        ?.numberOfArmiesRemaining ?? 0,
    onShowDetail: showDetail,
  };

  let clearSelectedTerritory = () => {
    dispatch({ type: "ClearSelection" });
  };

  let moveNextStep = () => {
    dispatch({ type: "MoveToNextStep" });
  };

  return (
    <WorldMapContext.Provider value={propsToAddToEachTile}>
      <Container fluid>
        <Row className="gamePanel">
          <Col>
            <div>
              <svg viewBox="0 40 210 160">
                {gameContext.currentMap.territories.map((x) => (
                  <NamedTerritoryTile name={x.name}  key={`tile_for_${x.name}`}/>
                ))}
              </svg>
            </div>
          </Col>
        </Row>
      </Container>
      <WorldMapControlPanel
        selectedTerritory={state.selectedTerritory}
        clearSelectedTerritory={clearSelectedTerritory}
        roundStep={state.roundStep}
        history={state.history}
        moveNextStep={moveNextStep}
      />
    </WorldMapContext.Provider>
  );
};

export default WorldMap;
