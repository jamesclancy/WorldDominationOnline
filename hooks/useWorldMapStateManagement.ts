import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { gameService } from "../data/client-services/GameService";
import { IGameContext } from "../data/models/Contexts";
import { getWorldMapStateFromContext } from "../data/models/Selectors";
import {
  applyMovementToStateAndGetHistoryDto,
  applyNewEventsToState,
  IWorldMapAction,
  IWorldMapState,
} from "../data/services/WorldStateTransformers";
import { useTimer } from "./useTimer";

export function useWorldMapStateManagement(
  gameId: string,
  gameContext: IGameContext
): [string, IWorldMapState, (action: IWorldMapAction) => Promise<void>] {
  const { data: session } = useSession();
  const currentUserName = session?.user?.name ?? "";

  const initialState = getWorldMapStateFromContext(gameId, gameContext);

  const [state, setState] = useState<IWorldMapState>(initialState);

  useEffect(() => {
    const loadedState: IWorldMapState = getWorldMapStateFromContext(
      gameId,
      gameContext
    );
    setState(loadedState);
  }, [gameContext, gameId]);

  const requiresDataRefresh = (
    newState: IWorldMapState,
    currentUserName: string
  ) => !newState.singleScreenPlay && newState.currentTurn !== currentUserName;

  const recursivePollForUpdates = () => {
    if (requiresDataRefresh(state, currentUserName)) {
      setState({ ...state });
      const promise = gameService.findNewGameEvents(
        state.gameId,
        state.roundCounter
      );
      promise.then((newEvents) => {
        if (requiresDataRefresh(state, currentUserName)) {
          const newState = applyNewEventsToState(state, newEvents);
          if (requiresDataRefresh(newState, currentUserName)) {
            setState({ ...newState });
          } else {
            setState({ ...state });
          }
        }
      });
      promise.catch((e) => {
        setState({
          ...state,
          errorMessage: e,
        });
      });
    }
  };

  useTimer(
    recursivePollForUpdates,
    Number(process.env.NEXT_PUBLIC_POLLING_MS_FOR_GAME_UPDATES)
  );

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
        return;
      }
    }

    setState({ ...newState, errorMessage: "" });
  }

  return [currentUserName, state, dispatchEventAndLogToSever];
}
