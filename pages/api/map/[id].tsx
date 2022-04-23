import {  MapRecord } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapRecord>
) {
  const { id } = req.query;
  const posts = await prisma.mapRecord.findUnique({
    where: {
      id: id[0],
    },
  });

  if (posts === null) res.status(404);
  else res.json(posts);
}
