import { useContext } from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  GameContext,
  IGameContext,
  ITileContext,
  WorldMapContext,
} from "../data/models/Contexts";
import { getTileContextFromGameContext } from "../data/models/Selectors";
import { useWorldMapStateManagement } from "../hooks/useWorldMapStateManagement";
import ErrorToast from "./ErrorToast";
import GameWonModal from "./GameWonModal";
import LoadingModal from "./LoadingModal";
import { NamedTerritoryTile } from "./TerritoryTile";

import WorldMapControlPanel from "./WorldMapControlPanel";

interface IWorldMapProps {
  gameId: string;
}

const WorldMap = (props: IWorldMapProps) => {
  let gameContext = useContext<IGameContext>(GameContext);

  const [currentUserName, state, dispatchEventAndLogToSever] =
    useWorldMapStateManagement(props.gameId, gameContext);

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

  let toggleSingleScreenPlay = async () => {
    await dispatchEventAndLogToSever({ type: "ToggleSimpleScreenPlay" });
  };

  return (
    <WorldMapContext.Provider value={propsToAddToEachTile}>
      <Container fluid>
        <Row className="gamePanel">
          <Col>
            {!state.singleScreenPlay &&
              state.currentTurn !== currentUserName && (
                <LoadingModal
                  loadingMessage={`Waiting for ${state.currentTurn}...`}
                  toggleSingleScreenPlay={toggleSingleScreenPlay}
                />
              )}
            {state.errorMessage && (
              <ErrorToast errorMessage={state.errorMessage} />
            )}
            {state.roundStep === "GameOver" && state.winner && (
              <GameWonModal winner={state.winner} />
            )}
            <div>
              <svg viewBox="0 40 210 160">
                {state.currentMap.territories.map((x) => (
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
