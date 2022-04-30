import type { GetServerSideProps, NextPage } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import TerritorySelect from "../../components/TerritorySelector";
import { gameService } from "../../data/client-services/GameService";
import GameMap from "../../data/models/GameMap";
import { TerritoryState } from "../../data/models/GameState";
import Player from "../../data/models/Player";
import { PersistanceService } from "../../data/services/PersistanceService";
import { GeneralPageLayout, Layout } from "../_layout";

interface ISelectTerritoriesProps {
  gameMap: GameMap;
  mapId: string;
  player1Name: string;
  possibleOpponents: string[];
}

const SelectTerritories: NextPage<ISelectTerritoriesProps> = (
  props: ISelectTerritoriesProps
) => {
  const router = useRouter();
  const startGame = async (
    territorySelection: TerritoryState[],
    players: [Player, Player]
  ) => {
    let createGameResponse: any = await gameService.createGame({
      mapId: props.mapId,
      playerIds: players.map((x) => x.name),
      territorySelection,
    });

    router.push(`/game/${createGameResponse.gameId}`);
  };

  return (
    <GeneralPageLayout title="Set-Up Game">
      <TerritorySelect
        Territories={props.gameMap.territories}
        onStartGame={startGame}
        player1Name={props.player1Name}
        possibleOpponents={props.possibleOpponents}
      />
    </GeneralPageLayout>
  );
};

function parseIdFromQueryString(queryValue: string | string[] | undefined) {
  if (queryValue === undefined) return undefined;
  if (typeof queryValue === "string") return queryValue;
  return queryValue[0];
}

export const getServerSideProps: GetServerSideProps<
  ISelectTerritoriesProps
> = async (context) => {
  const session = await getSession(context);
  if (!session) throw new Error("unauthorized");

  const playerName = session?.user?.name ?? "player1";
  const mapId =
    parseIdFromQueryString(context.query?.mapId) ?? "NO ID PROVIDED";
  const availableMaps = await PersistanceService.getGameMap(mapId);

  const availablePlayers =
    await PersistanceService.getPotentialOpponentsForPlayer(playerName);

  if (availableMaps === null) throw Error("Unable to locate map");

  const props: ISelectTerritoriesProps = {
    gameMap: availableMaps,
    mapId,
    player1Name: playerName,
    possibleOpponents: availablePlayers,
  };

  return { props };
};

export default SelectTerritories;
