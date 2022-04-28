import getConfig from "next/config";
import {
  AddGameEventResponse,
  CreateGameRequest,
  CreateGameResponse,
  FailureReport,
  RecentGameEventResponse,
} from "../models/Dtos";
import { HistoricalEvent } from "../models/GameState";

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/game`;

export const gameService = {
  createGame,
  addGameEvent,
  findNewGameEvents,
};

async function addGameEvent(
  gameId: string,
  historicalEvent: HistoricalEvent
): Promise<FailureReport | AddGameEventResponse> {
  const response = await fetch(baseUrl + `/${gameId}/event`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(historicalEvent),
  });

  const responseData = await response.json();

  if (response.status !== 200)
    return { type: "FailureReport", failureMessage: responseData };
  return { type: "AddGameEventResponse" };
}

async function findNewGameEvents(
  gameId: string,
  startAt: number
): Promise<FailureReport | RecentGameEventResponse> {
  const response = await fetch(baseUrl + `/${gameId}/event/${startAt}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const responseData = await response.json();

  if (response.status !== 200)
    return { type: "FailureReport", failureMessage: responseData };
  return responseData;
}

async function createGame(
  createGameRequest: CreateGameRequest
): Promise<FailureReport | CreateGameResponse> {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createGameRequest),
  });

  const responseData = await response.json();

  if (response.status !== 200)
    return { type: "FailureReport", failureMessage: responseData };
  return { gameId: responseData.gameId, type: "CreateGameResponse" };
}
