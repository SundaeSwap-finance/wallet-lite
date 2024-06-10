import { WalletBalanceMap } from "../classes/WalletBalanceMap.class";

/**
 * Compares two maps or wallet balance maps to determine if they are equal.
 *
 * @param {Map<string, any> | WalletBalanceMap} [map1] - The first map to compare.
 * @param {Map<string, any> | WalletBalanceMap} [map2] - The second map to compare.
 * @returns {boolean} - Returns true if the maps are equal, false otherwise.
 */
export const areAssetMapsEqual = (
  map1?: Map<string, any> | WalletBalanceMap,
  map2?: Map<string, any> | WalletBalanceMap
): boolean => {
  if (map1?.size !== map2?.size) {
    return false;
  }

  if (map1 && map2) {
    for (const [key, val] of map1) {
      if (!map2.has(key) || map2.get(key)?.amount !== val?.amount) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Compares two functions to determine if they are equal.
 *
 * @param {Function} func1 - The first function to compare.
 * @param {Function} func2 - The second function to compare.
 * @returns {boolean} - Returns true if the functions are considered equal, false otherwise.
 */
export const areFunctionsEqual = (func1: Function, func2: Function) => {
  // Check if both functions are the same reference
  if (func1 === func2) {
    return true;
  }

  // Check if their string representations are the same
  if (func1.toString() === func2.toString()) {
    return true;
  }

  // Check if both functions have the same number of arguments and the same argument names
  const funcArgs = func1.length;
  const callbackArgs = func2.length;

  if (funcArgs === callbackArgs) {
    const func1ArgNames = func1
      .toString()
      .match(/\(([^)]*)\)/)?.[1]
      .split(",")
      .map((arg) => arg.trim());
    const func2ArgNames = func2
      .toString()
      .match(/\(([^)]*)\)/)?.[1]
      .split(",")
      .map((arg) => arg.trim());

    if (func1ArgNames?.every((arg, index) => arg === func2ArgNames?.[index])) {
      return true;
    }
  }

  // If none of the checks passed, the functions are not considered equivalent
  return false;
};