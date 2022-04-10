import { DefaultButton, Stack } from "@fluentui/react";
import { useContext } from "react";
import { ITileContext, WorldMapContext } from "../data/models/Contexts";
import { CountryNameKey, TerritoryPotentialActions } from "../data/models/GameMap";
import { getPotentialActionsForTerritory } from "../data/models/Selectors";

interface IWorldMapControlPanelProps {
  selectedTerritory: string | undefined;
  clearSelectedTerritory: () => void;
}

interface IPotentialActionSet {
  name: CountryNameKey;
  action: TerritoryPotentialActions;
}

export const WorldMapControlPanel = (props: IWorldMapControlPanelProps) => {
  let worldMapContext = useContext<ITileContext>(WorldMapContext);

  let icon = (x: TerritoryPotentialActions) => {
    switch (x) {
      case "Select":
        return { iconName: "select" };
      case "Attack":
        return  { iconName: "target" };
      case "Move":
        return  { iconName: "move" };
      case "AddArmies":
        return  { iconName: "add" }; 
    }
  };

  let possibleActions = worldMapContext.currentMap.territories
    .map((x) => {
      let set: IPotentialActionSet = {
        name: x.name,
        action: getPotentialActionsForTerritory(worldMapContext, x.name),
      };
      return set;
    })
    .filter((x) => x.action !== "None")
    .map((x) => {
      let click = () => worldMapContext.onClick(x.name);
      let text = `${x.name}-${x.action}`;
      return <DefaultButton onClick={click} text={text} iconProps={icon(x.action)} />;
    });

  if (worldMapContext.selectedTerritory !== undefined)
    possibleActions.push(
      <DefaultButton onClick={props.clearSelectedTerritory} text="Clear Selection" iconProps={{iconName:"clean"}}></DefaultButton>
    );

  let movements = <Stack>{possibleActions}</Stack>;

  return (
    <>
      <h5>Current Turn: {worldMapContext.currentTurn}</h5>
      {movements}
    </>
  );
};

export default WorldMapControlPanel;
