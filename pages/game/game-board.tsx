import type { NextPage } from "next";
import { useContext, useEffect, useReducer } from "react";
import { Spinner } from "react-bootstrap";
import TerritorySelect from "../../components/TerritorySelector";
import WorldMap from "../../components/WorldMap";
import { GameContext, IGameContext } from "../../data/models/Contexts";
import { TerritoryState } from "../../data/models/GameState";
import Player from "../../data/models/Player";
import { constructInitialGameContext } from "../../data/client-services/WorldBuilder";
import { Layout } from "../_layout";
import { useSession } from "next-auth/react";

const Home: NextPage = () => {
  let gameContext = useContext<IGameContext>(GameContext);

  const initialState: IAppState = {
    currentPage: "Loading",
    startingPositions: [],
    players: gameContext.currentPlayers,
    currentContext: gameContext,
  };

  let [state, dispatch] = useReducer(appStateReducer, initialState);

  const { data: session } = useSession();

  const loadMapData = async () => {
    const mapData = await constructInitialGameContext();
    dispatch({ type: "MapDataLoaded", newContext: mapData });
  };

  useEffect(() => {
    loadMapData();
  }, []);

  let startGame = (
    territories: TerritoryState[],
    players: [Player, Player]
  ) => {
    dispatch({
      type: "PositionsSelected",
      startingPositions: territories,
      players: players,
    });
  };

  let switchPageToDisplay = (state: IAppState) => {
    switch (state.currentPage) {
      case "Loading":
        return (
          <>
            <br />
            <br />
            <Spinner animation="grow" role="status">
              <span className="visually-hidden">Loading Game Data...</span>
            </Spinner>
          </>
        );
      case "WorldMap":
        return <WorldMap />;
    }
  };

  const gameBoard = (
    <GameContext.Provider
      value={{
        ...state.currentContext,
        currentPositions: state.startingPositions,
        currentPlayers: state.players,
      }}
    >
      {switchPageToDisplay(state)}
    </GameContext.Provider>
  );

  return <Layout>{gameBoard}</Layout>;
};

interface IAppState {
  currentPage: "TerritorySelect" | "WorldMap" | "Loading";
  startingPositions: TerritoryState[];
  players: [Player, Player];
  currentContext: IGameContext;
}

interface IAppStateAction {
  type: "None" | "PositionsSelected" | "MapDataLoaded";
  startingPositions?: TerritoryState[];
  players?: [Player, Player];
  newContext?: IGameContext;
}

const appStateReducer = (state: IAppState, action: IAppStateAction) => {
  if (
    action.type === "PositionsSelected" &&
    action.players !== undefined &&
    action.startingPositions !== undefined
  ) {
    const newState: IAppState = {
      currentPage: "WorldMap",
      startingPositions: action.startingPositions,
      players: action.players,
      currentContext: state.currentContext,
    };
    return newState;
  }
  if (action.type === "MapDataLoaded" && action.newContext !== undefined) {
    const newState: IAppState = {
      currentPage: "TerritorySelect",
      startingPositions: state.startingPositions,
      players: state.players,
      currentContext: action.newContext,
    };
    return newState;
  }
  return state;
};

export default Home;
