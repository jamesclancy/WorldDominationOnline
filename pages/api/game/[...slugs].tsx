import type { NextApiRequest, NextApiResponse } from "next";
import { AddGameEventResponse, FailureReport } from "../../../data/models/Dtos";
import { HistoricalEvent } from "../../../data/models/GameState";
import PersistanceService from "../../../data/services/PersistanceService";

type Data = AddGameEventResponse | FailureReport;
type InputTypes = HistoricalEvent | undefined;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const [id, subPage] = parseSlug(req.query.slugs);

  switch (subPage) {
    case "event":
      await handleEventsRequest(id, req, res);
      break;
    default:
      res.status(404);
  }
}

async function handleEventsRequest(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === "POST") {
    const historicalEventToAdd = req.body as HistoricalEvent;
    
    await PersistanceService.saveGameEvent(id, historicalEventToAdd);
    
    res.json({ type: "AddGameEventResponse" });
    return;
  }

  res.json({ type: "FailureReport", failureMessage: "NO" });
}

function parseSlug(
  req: undefined | string[] | string
): [id: string, subPage: string] {
  if (req !== undefined) {
    if (typeof req === "string" || req.length === 1) return [req[0], "index"];
    if (req.length === 2) return [req[0], req[1]];
  }
  return ["unknown", "error"];
}
