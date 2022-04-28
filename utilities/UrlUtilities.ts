export function parseSingleValueFromQueryValue(
  queryValue: string | string[] | undefined
) {
  if (queryValue === undefined) return undefined;
  if (typeof queryValue === "string") return queryValue;
  return queryValue[0];
}
