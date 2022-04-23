import getConfig from "next/config";
import Router from "next/router";
import { CreateGameRequest, CreateGameResponse, FailureReport } from "../models/Dtos";
import { GameSummary, TerritoryState } from "../models/GameState";
import { api } from "./Remote";

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/game`;


export const gameService = {
  createGame,
};

async function createGame(
  createGameRequest: CreateGameRequest
): Promise<FailureReport | CreateGameResponse> {
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createGameRequest),
  });

  const responseData = await response.json();

  if (response.status !== 200) return { failureMessage: responseData };
  return { gameId:responseData.gameId };
} 
