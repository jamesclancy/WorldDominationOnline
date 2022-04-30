import { MapRecord } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapRecord>
) {
  const session = await getSession({ req });
  if (!session) throw new Error("Unauthorized");

  const { id } = req.query;
  const posts = await prisma.mapRecord.findUnique({
    where: {
      id: id[0],
    },
  });

  if (posts === null) res.status(404);
  else res.json(posts);
}
