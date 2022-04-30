import type { GetServerSideProps, NextPage } from "next";
import { useContext } from "react";
import WorldMap from "../../components/WorldMap";
import { GameContext, IGameContext } from "../../data/models/Contexts";
import { GameDetail, TerritoryState } from "../../data/models/GameState";
import { Layout } from "../_layout";
import PersistanceService from "../../data/services/PersistanceService";
import { parseSingleValueFromQueryValue } from "../../utilities/UrlUtilities";
import { getSession } from "next-auth/react";

interface IGameBoardProps {
  gameMap: GameDetail;
  gameId: string;
}

const GameBoard: NextPage<IGameBoardProps> = (props: IGameBoardProps) => {
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
          detailRequestedTerritory: undefined,
          roundCounter: props.gameMap.currentTurnCount,
          winner: props.gameMap.winningPlayer?.name ?? undefined,
        }}
      >
        <WorldMap gameId={props.gameId} />
      </GameContext.Provider>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<IGameBoardProps> = async (
  context
) => {
  const session = await getSession(context);
  if (!session) throw new Error("unauthorized");

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

export default GameBoard;
