export function shuffle(array: any[]): any[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export function rollBattleDice(attackers: number, defenders: number): [number, number] {
  const attackerAdvantage = attackers - defenders;

  let attackersLost = 0;
  let defendersLost = 0;

  const attackRolls = rollMultipleDice(Math.min(attackers, 3)).sort().reverse();
  const defenseRolls = rollMultipleDice(Math.min(defenders, 2)).sort().reverse();

  for (let roll in defenseRolls) {
    if (attackRolls[roll] > defenseRolls[roll]) defendersLost++;
    else attackersLost++;
  }

  return [attackers - attackersLost, defenders - defendersLost];
}

function rollMultipleDice(diceToRole: number): number[] {
  let results = [];
  for (let i = 0; i < diceToRole; i++) {
    results.push(rollDice());
  }
  return results;
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}
