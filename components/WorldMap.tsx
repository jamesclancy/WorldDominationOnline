import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { Col, Container, Modal, Row, Spinner, Toast, ToastContainer } from "react-bootstrap";
import { gameService } from "../data/client-services/GameService";
import {
  GameContext,
  IGameContext,
  ITileContext,
  WorldMapContext,
} from "../data/models/Contexts";
import { CountryNameKey } from "../data/models/GameMap";
import { TerritoryState } from "../data/models/GameState";
import {
  applyMovementToStateAndGetHistoryDto,
  IWorldMapAction,
  IWorldMapState,
} from "../data/services/WorldStateTransformers";
import { NamedTerritoryTile } from "./TerritoryTile";

import WorldMapControlPanel from "./WorldMapControlPanel";

interface IWorldMapProps {
  gameId: string;
}

const WorldMap = (props: IWorldMapProps) => {
  let gameContext = useContext<IGameContext>(GameContext);
  const initialState: IWorldMapState = {
    gameId: props.gameId,
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
    errorMessage: "",
  };

  const [state, setState] = useState<IWorldMapState>(initialState);
  const { data: session } = useSession();
  const [showErrorToast, setShowErrorToast] = useState(false);

  useEffect(() => {
    const loadedState: IWorldMapState = {
      gameId: props.gameId,
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
      roundCounter: gameContext.roundCounter,
      detailRequestedTerritory: undefined,
      errorMessage: "",
      singleScreenPlay: false,
    };
    setState(loadedState);
  }, [gameContext, props.gameId]);

  useEffect(() => {
    const pollForUpdates = async () => {
      const newEvents = await gameService.findNewGameEvents(
        state.gameId,
        state.roundCounter
      );
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

      if (
        newEvents.type === "RecentGameEventResponse" &&
        newEvents.currentRoundCounter > state.roundCounter
      ) {
        const newState: IWorldMapState = {
          ...state,
          currentTurn: newEvents.currentPlayerTurn?.name ?? state.currentTurn,
          roundCounter: newEvents.currentRoundCounter,
          roundStep: newEvents.currentTurnRoundStep,
          currentPositions: mergePositions(
            state.currentPositions,
            newEvents.updatedTerritoryStates
          ),
        };

        setState(newState);
      }

      const callPollIfNeeded = () => {
        if (
          !state.singleScreenPlay &&
          state.currentTurn !== session?.user?.name
        )
        pollForUpdates();
      };

      await setTimeout(() => {
        callPollIfNeeded();
      }, 1000); // this is not a very good solution
    };

    pollForUpdates();
  }, [state.currentTurn, state.singleScreenPlay]);

  async function dispatchEventAndLogToSever(action: IWorldMapAction) {
    const [newState, historyItem] = applyMovementToStateAndGetHistoryDto(
      state,
      action
    );

    if (historyItem) {
      const saveEvent = await gameService.addGameEvent(
        state.gameId,
        historyItem
      );

      if (saveEvent.type === "FailureReport") {
        setState({ ...state, errorMessage: saveEvent.failureMessage });
        setShowErrorToast(true);
        return;
      }
    }

    setState({ ...newState, errorMessage: "" });
  }

  let applyArmies = async (name: CountryNameKey, selectedArmies: number) => {
    await dispatchEventAndLogToSever({
      type: "TargetTile",
      armiesToApply: selectedArmies,
      target: name,
    });
  };

  let showDetail = async (name: CountryNameKey | undefined) => {
    await dispatchEventAndLogToSever({
      type: "ShowDetail",
      target: name,
    });
  };

  let trySelectTerritory = async (name: CountryNameKey) => {
    await dispatchEventAndLogToSever({ type: "SelectTile", target: name });
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

  let clearSelectedTerritory = async () => {
    await dispatchEventAndLogToSever({ type: "ClearSelection" });
  };

  let moveNextStep = async () => {
    await dispatchEventAndLogToSever({ type: "MoveToNextStep" });
  };

  let ErrorToast = () => (
    <ToastContainer className="p-3" position={"middle-center"}>
      <Toast
        show={showErrorToast}
        bg="warning"
        onClose={() => setShowErrorToast(false)}
        delay={5000}
        autohide
      >
        <Toast.Header>
          <strong className="me-auto">Error Occurred Saving Event</strong>
        </Toast.Header>
        <Toast.Body>{state.errorMessage}</Toast.Body>
      </Toast>
    </ToastContainer>
  );

  return (
    <WorldMapContext.Provider value={propsToAddToEachTile}>
      <Container fluid>
        <Row className="gamePanel">
          <Col>
          {!state.singleScreenPlay && state.currentTurn !== session?.user?.name && (
            <>
            <Modal
              show={true}
              backdrop="static"
              keyboard={false}
              centered
            >
              <Modal.Body className="" >
                <div className="d-flex justify-content-center align-self-center">
            <Spinner animation="border" variant="warning" size="sm">
              
            </Spinner>&nbsp;&nbsp;
            <strong>Waiting for {state.currentTurn}...</strong>
            </div>
              </Modal.Body>
            </Modal>
            </>
          )}
            {state.errorMessage && <ErrorToast />}
            <div>
              <svg viewBox="0 40 210 160">
                {gameContext.currentMap.territories.map((x) => (
                  <NamedTerritoryTile
                    name={x.name}
                    key={`tile_for_${x.name}`}
                  />
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
