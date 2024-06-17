import { WalletBalanceMap } from "../classes/WalletBalanceMap.class.js";

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
      if (!map2.has(key)) {
        return false;
      }

      if (typeof map2.get(key) === "object") {
        if (map2.get(key)?.amount !== val?.amount) {
          return false;
        }
      }

      if (typeof map2.get(key) !== typeof val) {
        return false;
      }

      if (map2.get(key).toString() !== val.toString()) {
        return false;
      }
    }
  }

  return true;
};
