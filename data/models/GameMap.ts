export type TerritoryPotentialActions =
  | "None"
  | "Move"
  | "Attack"
  | "Select"
  | "AddArmies";
const continentNames = [
  "NorthAmerica",
  "SouthAmerica",
  "Europe",
  "Asia",
  "Africa",
  "Oceania",
  "InvalidValue",
];
export const toContinentNameKey: (valueToTry: string) => ContinentNameKey = (
  valueToTry: string
) => {
  const contIndex = continentNames.findIndex((x) => x === valueToTry);
  if (contIndex === -1) return "InvalidValue";
  return continentNames[contIndex];
};
export type ContinentNameKey = typeof continentNames[number];
const countryNames = [
  "Alaska",
  "NorthWesternTerritory",
  "Alberta",
  "Ontario",
  "Quebec",
  "WesternUS",
  "EasternUS",
  "CentralAmerica",
  "Greenland",
  "Venezuela",
  "Brazil",
  "Peru",
  "Argentina",
  "Iceland",
  "GreatBritain",
  "WesternEurope",
  "Scandinavia",
  "NorthernEurope",
  "SouthernEurope",
  "Ukraine",
  "NorthAfrica",
  "Egypt",
  "EastAfrica",
  "Congo",
  "SouthAfrica",
  "Madagascar",
  "Afghanistan",
  "China",
  "Hindustan",
  "Irkutsk",
  "Japan",
  "Kamchatka",
  "MiddleEast",
  "Mongolia",
  "Siam",
  "Siberia",
  "Ural",
  "Yakutsk",
  "Indonesia",
  "NewGuinea",
  "WesternAustralia",
  "EasternAustralia",
  "InvalidValue"
];

export const toCountryNameKey: (valueToTry: string) => CountryNameKey = (
  valueToTry: string
) => {
  const contIndex = countryNames.findIndex((x) => x === valueToTry);
  if (contIndex === -1) return "InvalidValue";
  return countryNames[contIndex];
};
export type CountryNameKey = typeof countryNames[number];

export type Continent = {
  name: ContinentNameKey;
  displayName: string;
  bonusValue: number;
};

export type Territory = {
  name: CountryNameKey;
  displayText: string;
  continentName: ContinentNameKey;
  value: number;
  isoCodes?: string[];
};

export type TerritoryBridge = [CountryNameKey, CountryNameKey];

export type TerritoryPathDefinition = {
  name: CountryNameKey;
  pathDef: string;
  textBoxX: number;
  textBoxY: number;
  textBoxWidth: number;
  textBoxHeight: number;
};

export type GameMap = {
  continents: Continent[];
  territories: Territory[];
  territoryBridges: TerritoryBridge[];
  territoryPathDefinitions: TerritoryPathDefinition[];
};

export default GameMap;
