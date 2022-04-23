import type { NextPage } from "next";
import { GeneralPageLayout, Layout } from "./_layout";
import { useSession } from "next-auth/react";
import {
  Col,
  Container,
  Form,
  Row,
  Table,
  ToggleButton,
} from "react-bootstrap";
import { userService } from "../data/client-services/UserService";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GameSummary } from "../data/models/GameState";

const Home: NextPage = () => {
  const { data: session, status } = useSession();

  let [gameList, setGameList] = useState<GameSummary[]>([]);
  let [showCompletedGames, setShowCompletedGames] = useState<boolean>(false);

  useEffect(() => {
    if (session && session.user) {
      const fetchData = async () => {
        const games = await userService.getGameSummariesForUser(
          session?.user?.name ?? "",
          showCompletedGames
        );

        if (typeof games === "string") {
          setGameList([]);
        } else {
          setGameList(games);
        }
      };

      fetchData().catch(console.error);
    }
  }, [session, showCompletedGames]);

  const toggleShowCompletedGames = () => {
    setShowCompletedGames(!showCompletedGames);
  };

  const OutstandingGameList = () => {
    return (
      <>
        <div className="d-flex justify-content-end">
          <Form.Check
            type="switch"
            id="custom-switch"
            label="Show Completed Games"
            checked={showCompletedGames}
            onChange={toggleShowCompletedGames}
          />
        </div>
        <Table>
          <thead>
            <tr>
              <th></th>
              <td>Current Turn Count</td>
              <td>Current Turn Player</td>
              <td>Winner</td>
              <td>Player 1</td>
              <td>Player 2</td>
              <td>Start Date</td>
              <td>Updated Date</td>
            </tr>
          </thead>
          <tbody>
            {gameList.map((x) => {
              return (
                <tr>
                  <td>
                    <Link href={`/game/${x.id}`}>{x.id}</Link>
                  </td>
                  <td>{x.currentTurnCount}</td>
                  <td>{x.currentTurnPlayer?.name}</td>
                  <td>{x.winningPlayer?.name}</td>
                  <td>{x.player1.name}</td>
                  <td>{x.player2.name}</td>
                  <td>{x.startDate}</td>
                  <td>{x.updatedDate}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div className="justify-content-end text-end">
          <Link href="/game/create-game">Create a New Game</Link>
        </div>
      </>
    );
  };

  const homeContent = session && session.user ? <OutstandingGameList /> : <></>;

  return (
    <GeneralPageLayout
      title={
        status === "authenticated"
          ? `Welcome back ${session?.user?.name}`
          : "Welcome. Login to start or join a game."
      }
      leadInText="An exciting and low quality test of NextJs."
    >
      {homeContent}
    </GeneralPageLayout>
  );
};

export default Home;
