import getConfig from "next/config";
import Router from "next/router";
import { CreateGameRequest, CreateGameResponse, FailureReport } from "../models/Dtos";
import { GameSummary, TerritoryState } from "../models/GameState";
import { api } from "./Remote";

const { publicRuntimeConfig } = getConfig();
const baseUrl = `${publicRuntimeConfig.apiUrl}/user`;


export const userService = {
  getGameSummariesForUser,
};

async function getGameSummariesForUser(userName: string, includeCompleted? : boolean) : Promise<string | GameSummary[]> {
  const response = await fetch(`${baseUrl}/${userName}/games?includeCompleted=${includeCompleted ?? false}`, {
    method: "POST",
    headers: {
      'accept': 'application/json'
    }
  });

  const responseData = await response.json();

  if (response.status !== 200) return `Request failed with: ${responseData}`;
  return responseData;
} 
