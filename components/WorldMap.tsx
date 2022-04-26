import { useSession } from "next-auth/react";
import { useContext, useEffect, useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { gameService } from "../data/client-services/GameService";
import {
  GameContext,
  IGameContext,
  ITileContext,
  WorldMapContext,
} from "../data/models/Contexts";
import {
  getTileContextFromGameContext,
  getWorldMapStateFromContext,
} from "../data/models/Selectors";
import {
  applyMovementToStateAndGetHistoryDto,
  applyNewEventsToState,
  IWorldMapAction,
  IWorldMapState,
} from "../data/services/WorldStateTransformers";
import ErrorToast from "./ErrorToast";
import LoadingModal from "./LoadingModal";
import { NamedTerritoryTile } from "./TerritoryTile";

import WorldMapControlPanel from "./WorldMapControlPanel";

interface IWorldMapProps {
  gameId: string;
}

const WorldMap = (props: IWorldMapProps) => {
  let gameContext = useContext<IGameContext>(GameContext);

  const initialState = getWorldMapStateFromContext(props.gameId, gameContext);

  const [state, setState] = useState<IWorldMapState>(initialState);
  const { data: session } = useSession();
  const [showErrorToast, setShowErrorToast] = useState(false);

  const currentUserName = session?.user?.name;

  useEffect(() => {
    const loadedState: IWorldMapState = getWorldMapStateFromContext(
      props.gameId,
      gameContext
    );
    setState(loadedState);
  }, [gameContext, props.gameId]);

  const recursivePollForUpdates = () => {
    const promise = gameService.findNewGameEvents(
      state.gameId,
      state.roundCounter
    );
    promise.then((newEvents) => {
      const newState = applyNewEventsToState(state, newEvents);
      setState(newState);

      if (
        !newState.singleScreenPlay &&
        newState.currentTurn !== session?.user?.name
      )
        setTimeout(() => recursivePollForUpdates(), 750);
    });
    promise.catch((e) => {
      setState({ ...state, errorMessage: e });
    });
  };

  useEffect(() => {
    if (
      currentUserName &&
      !state.singleScreenPlay &&
      state.currentTurn !== currentUserName
    ) {
      recursivePollForUpdates();
    }
  }, [
    state.currentTurn,
    state.singleScreenPlay,
    currentUserName
  ]);

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

  let propsToAddToEachTile: ITileContext = getTileContextFromGameContext(
    gameContext,
    state,
    dispatchEventAndLogToSever
  );

  let clearSelectedTerritory = async () => {
    await dispatchEventAndLogToSever({ type: "ClearSelection" });
  };

  let moveNextStep = async () => {
    await dispatchEventAndLogToSever({ type: "MoveToNextStep" });
  };

  let toggleSingleScreenPlay = () => {
    setState({ ...state, singleScreenPlay: !state.singleScreenPlay });
  };

  return (
    <WorldMapContext.Provider value={propsToAddToEachTile}>
      <Container fluid>
        <Row className="gamePanel">
          <Col>
            {!state.singleScreenPlay &&
              state.currentTurn !== session?.user?.name && (
                <LoadingModal
                  loadingMessage={`Waiting for ${state.currentTurn}...`}
                  toggleSingleScreenPlay={toggleSingleScreenPlay}
                />
              )}
            {state.errorMessage && (
              <ErrorToast
                show={showErrorToast}
                errorMessage={state.errorMessage}
                closeToast={() => setShowErrorToast(false)}
              />
            )}
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
        singleScreenPlay={state.singleScreenPlay}
        toggleSingleScreenPlay={toggleSingleScreenPlay}
      />
    </WorldMapContext.Provider>
  );
};

export default WorldMap;
