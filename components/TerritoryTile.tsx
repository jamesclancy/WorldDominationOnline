import { useContext, useEffect, useReducer } from "react";
import { Button, Form, ModalDialog } from "react-bootstrap";
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
}

export interface INamedTerritoryTile {
  name: CountryNameKey;
}

export const NamedTerritoryTile = (props: INamedTerritoryTile) => {
  let worldMapContext = useContext<ITileContext>(WorldMapContext);

  let terPops = buildTerritoryPropsForTile(worldMapContext, props.name);

  if (typeof terPops === "string") {
    console.log(terPops);
    return <></>;
  }
  return <TerritoryTile {...terPops} />;
};

interface ITerritoryState {
  showPopover: boolean;
  selectedArmies: number;
}

interface ITerritoryStateAction {
  type: "None" | "TogglePopover" | "SelectArmies" | "Cancel" | "Confirm";
  armyCount?: number;
}

const territoryStateReducer = (state: ITerritoryState, action: ITerritoryStateAction) => {
  switch (action.type) {
    case "Cancel":
      return { ...state, showPopover: false };
    case "TogglePopover":
      return { ...state, showPopover: !state.showPopover };
    case "SelectArmies":
      return { ...state, selectedArmies: action.armyCount ?? 1 };
  }

  return state;
};

const TerritoryTile = (props: ITerritoryProps) => {
  let initialState: ITerritoryState = { showPopover: false, selectedArmies: props.possibleArmiesToApply };
  let [state, dispatch] = useReducer(territoryStateReducer, initialState);

  const isSelected = props.isTerritorySelected;
  const isClickable = props.potentialActions !== "None";

  useEffect(() => {
    dispatch({ type: "SelectArmies", armyCount: props.possibleArmiesToApply });
  }, [props]);

  function click() {
    if (isClickable) props.select();
  }

  function applyArmies() {
    togglePopover();
    props.applyArmy(state.selectedArmies);
  }

  function togglePopover() {
    dispatch({ type: "TogglePopover" });
  }

  function setArmies(armies: number) {
    dispatch({ type: "SelectArmies", armyCount: armies });
  }

  let popOverContent = () => {
    let slider =
      props.possibleArmiesToApply === 1 ? (
        <p>Are you sure you want to use your only spare army?</p>
      ) : (
        <>
          <p>Select armies to move.</p>
          <Form.Range
            key="slider"
            min={1}
            max={props.possibleArmiesToApply}
            onChange={setArmies}
            value={state.selectedArmies}
          />
        </>
      );

    return (
      <div className="popOverSelector">
        <h4>Confirm {props.potentialActions}</h4>
        {slider}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
          <Button onClick={togglePopover}>
            Cancel
          </Button>
          <Button onClick={applyArmies}>
            Confirm
          </Button>
        </div>
      </div>
    );
  };

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
      <g onClick={togglePopover}>
        <path
          d={props.pathDefinition.pathDef}
          key={props.territory.name}
          stroke={strokeColor()}
          strokeWidth={0.3}
          fill={fillColor()}
        ></path>
        {textGroup}
      </g>
      <ModalDialog hidden={!state.showPopover}>
        {popOverContent()}
      </ModalDialog>
    </>
  );
};
