import type { NextApiRequest, NextApiResponse } from "next";
import { GameSummary } from "../../../data/models/GameState";
import PersistanceService from "../../../data/services/PersistanceService";

type Data = GameSummary[] | null;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const [id, subPage] = parseSlug(req.query.slugs);

  switch(subPage) {
    case "games":
      await gameResultsForUser(id, res);
      break;
    default:
      res.status(404);
  }
}

async function gameResultsForUser(id: string, res: NextApiResponse<Data> ) {
  var games = await PersistanceService.getGameSummariesForUser(id);
  res.json(games);
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
