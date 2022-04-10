import { DefaultButton, TextField } from "@fluentui/react";
import { on } from "events";
import { ChangeEvent, ChangeEventHandler, useCallback, useReducer } from "react";
import { Territory } from "../data/models/GameMap";
import { TerritoryState } from "../data/models/GameState";
import Player from "../data/models/Player";
import { shuffle } from "../utilities/Randomization";

export interface ITerritorySelectProps {
  onStartGame(results: TerritoryState[], players: [Player, Player]): void;
  Territories: Territory[];
}

interface ITerritorySelectState {
  cellIntents: boolean[][];
  dataForTable: string[][];
  player1Name: string;
  player2Name: string;
  canSubmitData: boolean;
}

interface ITerritorySelectAction {
  type:
    | "None"
    | "Randomize"
    | "UpdatePlayer1Name"
    | "UpdatePlayer2Name"
    | "UpdatePlayerInTable"
    | "UpdateArmiesInTable";
  newValue?: string;
  rowIndex?: number;
}

const territorySelectReducer = (state: ITerritorySelectState, action: ITerritorySelectAction) => {
  switch (action.type) {
    case "Randomize":
      return setRandomDataSet(state);
    case "UpdatePlayer1Name":
      if (!action.newValue) return state;
      return {
        ...attemptToUpdatePlayerNameInTable(state, state.player1Name, action.newValue),
        player1Name: action.newValue,
      };
    case "UpdatePlayer2Name":
      if (!action.newValue) return state;
      return {
        ...attemptToUpdatePlayerNameInTable(state, state.player2Name, action.newValue),
        player2Name: action.newValue,
      };
    case "UpdatePlayerInTable":
      if (!action.newValue || !action.rowIndex) return state;
      return updateTableForValue(
        state,
        action.newValue,
        action.newValue === state.player1Name || action.newValue === state.player2Name ? false : true,
        action.rowIndex,
        2
      );
    case "UpdateArmiesInTable":
      if (!action.newValue || !action.rowIndex) return state;
      return updateTableForValue(
        state,
        action.newValue,
        isNaN(parseInt(action.newValue)) ? true : false,
        action.rowIndex,
        3
      );
  }

  return state;
};

const TerritorySelect = (props: ITerritorySelectProps) => {
  let initData = props.Territories.map((x) => [x.continentName, x.name, "", "0"]);

  let startingIntents = props.Territories.map((x) => [false, false, false, false]);

  const initialState: ITerritorySelectState = {
    cellIntents: startingIntents,
    dataForTable: initData,
    player1Name: "player1",
    player2Name: "player2",
    canSubmitData: false,
  };
  let [state, dispatch] = useReducer(territorySelectReducer, initialState);

  const setRandomDataSet = () => {
    dispatch({ type: "Randomize" });
  };


  const onChangePlayerName = (rowIndex: number, columnIndex: number)  =>  useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      changePlayer(newValue ?? "", rowIndex, columnIndex);
    },
    [],
  );

  
  const onChangeArmies = (rowIndex: number, columnIndex: number)  =>  useCallback(
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      changeArmies(newValue ?? "", rowIndex, columnIndex);
    },
    [],
  );

  const cellRenderer = (rowIndex: number, columnIndex: number) => {
    if (columnIndex === 2) {
      return (
        <TextField
          value={state.dataForTable[rowIndex][columnIndex]}
          onChange={(onChangePlayerName(rowIndex, columnIndex))}
          invalid = {state.cellIntents[rowIndex][columnIndex]}
        ></TextField>
      );
    }

    if (columnIndex === 3) {
      return (
        <TextField
          value={state.dataForTable[rowIndex][columnIndex]}
          onChange={onChangeArmies(rowIndex, columnIndex)}
          invalid={state.cellIntents[rowIndex][columnIndex]}
        ></TextField>
      );
    }

    return (<>{state.dataForTable[rowIndex][columnIndex]}</>);
  };

  const columns =
  (
    <>
    <tr>
    <th>Continent</th><th>Territory</th><th>Owner</th><th>AdditionalArmiesToPlace</th>
    </tr>
    {state.dataForTable.map((row : string[], y) => {
      return (<tr>{row.map((_, x) => (<td>{cellRenderer(x, y)}</td>))}</tr>)
    })}
    
    </>
  );
  

  const submitData = () => {
    var results: TerritoryState[] = [];
    for (var i = 0; i < state.dataForTable.length; i++) {
      var myData = {
        territoryName: state.dataForTable[i][1],
        playerName: state.dataForTable[i][2],
        armies: parseInt(state.dataForTable[i][3]),
      };
      results.push(myData);
    }

    var players: [Player, Player] = [
      { name: state.player1Name, displayName: state.player1Name },
      { name: state.player2Name, displayName: state.player2Name },
    ];

    props.onStartGame(results, players);
  };

  const player1NameUpdated = function 
    (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string)
   {
    dispatch({ type: "UpdatePlayer1Name", newValue: newValue ?? "" });
  };

  const player2NameUpdated = function
  (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string)
   {
    dispatch({ type: "UpdatePlayer2Name", newValue: newValue ?? "" });
  };

  const changeArmies = (value: string, rowIndex: number | undefined, columnIndex: number | undefined) => {
    dispatch({
      type: "UpdateArmiesInTable",
      newValue: value,
      rowIndex: rowIndex,
    });
  };

  const changePlayer = (value: string, rowIndex: number | undefined, columnIndex: number | undefined) => {
    dispatch({
      type: "UpdatePlayerInTable",
      newValue: value,
      rowIndex: rowIndex,
    });
  };

  return (
    <>
      <section>
        <h3>Player Names</h3>
        <TextField disabled={false}  value={state.player1Name} 
        type="text" onChange={player1NameUpdated} />
        <TextField disabled={false} value={state.player2Name} type="text" onChange={player2NameUpdated} />
      </section>
      <section>
        <h3>Territory Select</h3>
        <table>{columns}</table>
        <DefaultButton onClick={submitData} disabled={state.canSubmitData === false}>
          Start Game
        </DefaultButton>
        <DefaultButton onClick={setRandomDataSet}>Randomize Selection</DefaultButton>
      </section>
    </>
  );
};

const setRandomDataSet = (state: ITerritorySelectState) => {
  let totalPlayer1 = 40 - state.dataForTable.length / 2;
  let totalPlayer2 = 40 - state.dataForTable.length / 2;

  function armiesToApply(playerName: string) {
    let armiesToApply = 1;
    if (playerName === state.player1Name) {
      let ran = Math.floor(Math.random() * totalPlayer1);
      armiesToApply += ran;
      totalPlayer1 -= ran;
    }

    if (playerName === state.player2Name) {
      let ran = Math.floor(Math.random() * totalPlayer2);
      armiesToApply += ran;
      totalPlayer2 -= ran;
    }
    return armiesToApply;
  }

  const shuffledDataForTable = shuffle(state.dataForTable);

  let playerPicks = shuffledDataForTable
    .map((x, index) => ({
      value: index % 2 === 0 ? state.player1Name : state.player2Name,
      sort: Math.random(),
      armiesToApply: armiesToApply(index % 2 === 0 ? state.player1Name : state.player2Name),
    }))
    .sort((x) => x.sort);

  let updatedDataForTable = shuffledDataForTable.map((x, rowIndex) => {
    x[2] = playerPicks[rowIndex].value;
    x[3] = playerPicks[rowIndex].armiesToApply.toString();
    return x;
  });

  updatedDataForTable.forEach((element, index) => {
    if (totalPlayer1 > 0 && element[2] === state.player1Name) {
      element[3] = (parseInt(element[3]) + 1).toString();
      totalPlayer1--;
    }
  });

  updatedDataForTable.forEach((element, index) => {
    if (totalPlayer2 > 0 && element[2] === state.player2Name) {
      element[3] = (parseInt(element[3]) + 1).toString();
      totalPlayer2--;
    }
  });

  return { ...state, canSubmitData: true, dataForTable: updatedDataForTable };
};

const attemptToUpdatePlayerNameInTable = (state: ITerritorySelectState, preName: string, newName: string) => {
  let updatedDataForTable = state.dataForTable;

  state.dataForTable.forEach((element, row) => {
    if (element[2] === preName) {
      updatedDataForTable[row] = [element[0], element[1], newName, element[3]];
    }
  });

  return { ...state, dataForTable: updatedDataForTable };
};

const updateTableForValue = (
  state: ITerritorySelectState,
  value: string,
  intent: boolean,
  rowIndex: number,
  columnIndex: number
) => {
  const testCanSubmitData = () => {
    state.cellIntents.forEach((x) => {
      x.forEach((cell) => {
        if (!cell) return false;
      });
    });

    const totalArmies = state.dataForTable.map((x) => x[3]).reduce((x, y) => x + parseInt(y), 0);

    if (totalArmies !== 80) return false;

    return true;
  };

  let updatedDataForTable = state.dataForTable;
  let updatedCellIntents = state.cellIntents;

  if (state.dataForTable[rowIndex][columnIndex] !== value) {
    updatedDataForTable[rowIndex][columnIndex] = value;
  }

  if (state.cellIntents[rowIndex][columnIndex] !== intent) {
    updatedCellIntents[rowIndex][columnIndex] = intent;
  }

  return {
    ...state,
    dataForTable: updatedDataForTable,
    cellIntents: updatedCellIntents,
    canSubmitData: testCanSubmitData(),
  };
};

export default TerritorySelect;
