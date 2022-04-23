import type { GetServerSideProps, NextPage } from "next";
import { useContext, useEffect, useReducer } from "react";
import WorldMap from "../../components/WorldMap";
import { GameContext, IGameContext } from "../../data/models/Contexts";
import { GameDetail, TerritoryState } from "../../data/models/GameState";
import Player from "../../data/models/Player";
import { Layout } from "../_layout";
import PersistanceService from "../../data/services/PersistanceService";
import { parseSingleValueFromQueryValue } from "../../utilities/UrlUtilities";

interface IGameBoardProps {
  gameMap: GameDetail;
  gameId: string;
}

const GameBoard: NextPage<IGameBoardProps> = (
  props: IGameBoardProps
) => {
  let gameContext = useContext<IGameContext>(GameContext);

  return (
    <Layout>
    <GameContext.Provider
      value={{
        currentMap: props.gameMap.currentMap,
        roundStep: props.gameMap.currentTurnStep,
        currentTurn: props.gameMap.currentTurn.name,
        currentTurnOutstandingArmies: 0,
        selectedTerritory: undefined,
        currentPositions: props.gameMap.currentTerritoryState,
        currentPlayers: [props.gameMap.player1, props.gameMap.player2],
        detailRequestedTerritory: undefined
      }}
    >
       <WorldMap gameId={props.gameId}/>
    </GameContext.Provider>
    </Layout>
  );
};


export const getServerSideProps: GetServerSideProps<
IGameBoardProps
> = async (context) => {
  const gameId =
  parseSingleValueFromQueryValue(context.query?.id) ?? "NO ID PROVIDED";

  const gameInformation = await PersistanceService.getGameDetail(gameId);

  if (gameInformation === null) throw Error("Unable to locate map");

  const props: IGameBoardProps = {
    gameMap: gameInformation,
    gameId,
  };

  return { props };
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

export default GameBoard;