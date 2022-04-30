import { useContext } from "react";
import { ITileContext, WorldMapContext } from "../data/models/Contexts";
import {
  Continent,
  CountryNameKey,
  Territory,
  TerritoryPathDefinition,
  TerritoryPotentialActions,
} from "../data/models/GameMap";
import { TerritoryState } from "../data/models/GameState";
import { buildTerritoryPropsForTile } from "../data/models/Selectors";
import ApplyArmiesModal from "./ApplyArmiesModal";

export interface ITerritoryProps {
  applyArmy(selectedArmies: number): void;
  potentialActions: TerritoryPotentialActions;
  isTerritorySelected: boolean;
  possibleArmiesToApply: number;
  territory: Territory;
  continent: Continent;
  territoryState?: TerritoryState;
  armies: number;
  pathDefinition: TerritoryPathDefinition;
  ownerIndex: number;
  select(): void;
  requestShowDetail(): void;
  clearDetail(): void;
  shouldShowDetail: boolean;
}

export interface INamedTerritoryTile {
  name: CountryNameKey;
}

export const NamedTerritoryTile = (props: INamedTerritoryTile) => {
  let worldMapContext = useContext<ITileContext>(WorldMapContext);

  let terPops = buildTerritoryPropsForTile(worldMapContext, props.name);

  if (typeof terPops === "string") {
    return <></>;
  }
  return <TerritoryTile {...terPops} />;
};

const TerritoryTile = (props: ITerritoryProps) => {
  const isSelected = props.isTerritorySelected;
  const isClickable = props.potentialActions !== "None";

  function click() {
    if (isClickable) props.select();
  }

  const fillColor = () => {
    switch (props.potentialActions) {
      case "None":
        return "#cffefa";
      case "Attack":
        return "#E68E90";
      case "Move":
        return "#E6C78E";
      case "Select":
        return "#8EE698";
      case "AddArmies":
        return "#6CC476";
    }
  };

  const strokeColor = () => {
    if (isSelected) return "#FFB703";

    return "#000";
  };

  const textColor = () => {
    switch (props.potentialActions) {
      case "None":
        return "#00f";
      case "Attack":
        return "#00f";
      case "Move":
        return "#ff0";
      case "Select":
        return "#00f";
    }
  };

  const bannerColor = props.ownerIndex === 1 ? "#FB8500" : "#023047";

  const textGroup = (
    <>
      <rect
        x={props.pathDefinition.textBoxX}
        width={props.pathDefinition.textBoxWidth}
        y={props.pathDefinition.textBoxY}
        height={3}
        fill={bannerColor}
        rx={3}
      />
      <rect
        x={props.pathDefinition.textBoxX + 1}
        width={2}
        y={props.pathDefinition.textBoxY - 1}
        height={5}
        fill={bannerColor}
        rx={0}
      />
      <text
        fontSize="2"
        textAnchor="start"
        dominantBaseline="before-edge"
        x={props.pathDefinition.textBoxX + 3.5}
        width={props.pathDefinition.textBoxWidth - 5}
        y={props.pathDefinition.textBoxY + 2.2}
        height={props.pathDefinition.textBoxHeight}
        color={textColor()}
        href={"#" + props.territory.name}
        fill="#fff"
      >
        {props.territory.displayText}
      </text>
      <text
        fontSize="2"
        textAnchor="start"
        dominantBaseline="before-edge"
        x={props.pathDefinition.textBoxX + (props.armies > 9 ? 1 : 1.5)}
        width={props.pathDefinition.textBoxWidth - 5}
        y={props.pathDefinition.textBoxY + 2.2}
        height={props.pathDefinition.textBoxHeight}
        color={textColor()}
        href={"#" + props.territory.name}
        fill="#fff"
      >
        {props.armies}
      </text>
    </>
  );

  switch (props.potentialActions) {
    case "Select":
    case "None":
      return (
        <g onClick={click}>
          <path
            d={props.pathDefinition.pathDef}
            key={props.territory.name}
            fill={fillColor()}
            stroke={strokeColor()}
            strokeWidth={0.3}
          ></path>
          {textGroup}
        </g>
      );
  }

  return (
    <>
      <g onClick={props.requestShowDetail}>
        <path
          d={props.pathDefinition.pathDef}
          key={props.territory.name}
          stroke={strokeColor()}
          strokeWidth={0.3}
          fill={fillColor()}
        ></path>
        {textGroup}
      </g>
      {props.shouldShowDetail && (
        <ApplyArmiesModal
          possibleArmiesToApply={props.possibleArmiesToApply}
          potentialActions={props.potentialActions}
          applyArmies={props.applyArmy}
          clearDetail={props.clearDetail}
        />
      )}
    </>
  );
};
