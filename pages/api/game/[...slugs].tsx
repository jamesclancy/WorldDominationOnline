import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import {
  AddGameEventResponse,
  FailureReport,
  RecentGameEventResponse,
} from "../../../data/models/Dtos";
import { HistoricalEvent } from "../../../data/models/GameState";
import PersistanceService from "../../../data/services/PersistanceService";

type Data = AddGameEventResponse | RecentGameEventResponse | FailureReport;
type InputTypes = HistoricalEvent | undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getSession({ req });
  if (!session) throw new Error("Unauthorized");

  const [id, subPage, numberValue] = parseSlug(req.query.slugs);

  switch (subPage) {
    case "event":
      await handleEventsRequest(id, numberValue, req, res);
      return;
    default:
      break;
  }
  res.status(404);
}

async function handleEventsRequest(
  id: string,
  numberValue: number | undefined,
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const historicalEventToAdd = req.body as HistoricalEvent;

    await PersistanceService.saveGameEvent(id, historicalEventToAdd);

    res.json({ type: "AddGameEventResponse" });
    return;
  } else if (req.method === "GET") {
    const startCount = numberValue ?? -1;

    const [
      currentPlayer,
      currentTurn,
      currentRoundStep,
      updatedTerritoryStates,
      historicalEvents,
    ] = await PersistanceService.getGameEvents(id, startCount);

    const returnValue: RecentGameEventResponse = {
      type: "RecentGameEventResponse",
      startingRoundCount: startCount,
      currentPlayerTurn: currentPlayer,
      currentRoundCounter: currentTurn,
      currentTurnRoundStep: currentRoundStep,
      updatedTerritoryStates: updatedTerritoryStates,
      eventDetails: historicalEvents,
    };

    res.json(returnValue);
    return;
  }

  res.json({ type: "FailureReport", failureMessage: "NO" });
}

function parseSlug(
  req: undefined | string[] | string
): [id: string, subPage: string, numericValue: number | undefined] {
  if (req !== undefined) {
    if (typeof req === "string" || req.length === 1)
      return [req[0], "index", undefined];
    if (req.length === 2) return [req[0], req[1], undefined];
    if (req.length === 3) {
      const thirdField = req[2];
      return [req[0], req[1], Number(thirdField)];
    }
  }
  return ["unknown", "error", undefined];
}
