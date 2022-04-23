import { constructInitialGameContext } from "./data/client-services/WorldBuilder";
import prisma from "./lib/prisma";

export async function seedDatabase() {
  let gameInfo = await constructInitialGameContext();

  await gameInfo.currentMap.continents.forEach(async (cont) => {
    let contRecord = await prisma.continentRecord.findFirst({
      where: { name: cont.name },
    });
    if (contRecord === undefined)
      await prisma.continentRecord.create({
        data: {
          mapId: id[0],
          name: cont.name,
          displayName: cont.displayName,
          bonusValue: cont.bonusValue,
        },
      });
  });

  await gameInfo.currentMap.territories.forEach(async (terr) => {
    let contRecord = await prisma.continentRecord.findFirst({
      where: { name: terr.continentName },
    });
    let path = gameInfo.currentMap.territoryPathDefinitions.find(
      (x) => x.name === terr.name
    );
    if (contRecord !== null && path != undefined)
      await prisma.territoryRecord.create({
        data: {
          continentId: contRecord.id,
          name: terr.name,
          value: terr.value,
          pathDef: path.pathDef,
          displayText: terr.displayText,
          textBoxHeight: path.textBoxHeight,
          textBoxWidth: path.textBoxWidth,
          textBoxX: path.textBoxX,
          textBoxY: path.textBoxY,
        },
      });
  });

  await gameInfo.currentMap.territoryBridges.forEach(async (bridge) => {
    let terOne = await prisma.territoryRecord.findFirst({
      where: { name: bridge[0] },
    });
    let terTwo = await prisma.territoryRecord.findFirst({
      where: { name: bridge[1] },
    });
    if (terOne !== null && terTwo != null)
      await prisma.territoryBridgeRecord.create({
        data: {
          primaryTerritoryId: terOne.id,
          secondaryTerritoryId: terTwo.id,
        },
      });
  });
}
