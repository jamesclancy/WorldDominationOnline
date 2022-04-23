import { useContext } from "react";
import {
  Button,
  Row,
  Nav,
  Navbar,
  NavDropdown,
  Container,
} from "react-bootstrap";
import { ITileContext, WorldMapContext } from "../data/models/Contexts";
import {
  CountryNameKey,
  TerritoryPotentialActions,
} from "../data/models/GameMap";
import { RoundStepType } from "../data/models/GameState";
import { getPotentialActionsForTerritory } from "../data/models/Selectors";

interface IWorldMapControlPanelProps {
  selectedTerritory: string | undefined;
  roundStep: RoundStepType;
  history: string;
  clearSelectedTerritory: () => void;
  moveNextStep: () => void;
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
        return { iconName: "target" };
      case "Move":
        return { iconName: "move" };
      case "AddArmies":
        return { iconName: "add" };
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
      return <NavDropdown.Item onClick={click}>{text}</NavDropdown.Item>;
    });

  if (worldMapContext.selectedTerritory !== undefined)
    possibleActions.push(
      <>
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={props.clearSelectedTerritory}>
          Clear Selection
        </NavDropdown.Item>
      </>
    );

  let movements = <Row>{possibleActions}</Row>;

  return (
    <>
      <Navbar fixed="bottom">
        <Container fluid>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav
              className="me-auto my-2 my-lg-0"
              navbarScroll
              style={{ backgroundColor: "#fff" }}
            >
              {" "}
              <Navbar.Brand style={{ backgroundColor: "#fff" }}>
                {worldMapContext.currentTurn}'s Turn
              </Navbar.Brand>
              <Nav.Link active={worldMapContext.roundStep === "AddArmies"}>
                Planning Phase
              </Nav.Link>
              <Nav.Link active={worldMapContext.roundStep === "Attack"}>
                Attack Phase
              </Nav.Link>
              <Nav.Link active={worldMapContext.roundStep === "Movement"}>
                Reallocate Phase
              </Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown
                title="Potential Moves"
                drop={"up"}
                style={{ backgroundColor: "#fff" }}>
                {movements}
              </NavDropdown>
              <Nav.Link
                onClick={props.moveNextStep}
                style={{ backgroundColor: "#fff" }}
              >
                Move to Next Step
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};

export default WorldMapControlPanel;
