import { NextApiRequest, NextApiResponse } from "next";
import { TerritoryState } from "../../../data/models/GameState";
import { PersistanceService } from "../../../data/services/PersistanceService";
import prisma from "../../../lib/prisma";

interface CreateGameApiRequest extends NextApiRequest {
  body: {
    mapId: string;
    playerIds: string[];
    territorySelection: TerritoryState[];
  };
}

export default async function handler(
  req: CreateGameApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    res.status(200);
  }
  if (req.method === "POST") {
    const createRequest = req.body;

    const gameId = await PersistanceService.createGame(createRequest);

    res.json({gameId});
    res.status(200);
  }
}
