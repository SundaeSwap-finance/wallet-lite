import { WalletBalanceMap } from "../classes/WalletBalanceMap.class.js";

/**
 * Compares two maps or wallet balance maps to determine if they are equal.
 *
 * @param {Map<string, any> | WalletBalanceMap} [map1] - The first map to compare.
 * @param {Map<string, any> | WalletBalanceMap} [map2] - The second map to compare.
 * @returns {boolean} - Returns true if the maps are equal, false otherwise.
 */
export const areAssetMapsEqual = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map1?: Map<string, any> | WalletBalanceMap,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map2?: Map<string, any> | WalletBalanceMap,
): boolean => {
  if (map1?.size !== map2?.size) {
    return false;
  }

  if (map1 && map2) {
    for (const [key, val] of map1) {
      if (!map2.has(key)) {
        return false;
      }

      const other = map2.get(key);

      if (typeof other !== typeof val) {
        return false;
      }

      if (typeof other === "object") {
        if (other?.amount !== val?.amount) {
          return false;
        }

        // Compare metadata by shallow key comparison
        if (other?.metadata && val?.metadata) {
          const otherMeta = other.metadata;
          const valMeta = val.metadata;
          const otherKeys = Object.keys(otherMeta);
          const valKeys = Object.keys(valMeta);

          if (otherKeys.length !== valKeys.length) {
            return false;
          }

          for (const k of otherKeys) {
            if (otherMeta[k] !== valMeta[k]) {
              return false;
            }
          }
        } else if (other?.metadata !== val?.metadata) {
          return false;
        }
      }

      if (other?.toString() !== val?.toString()) {
        return false;
      }
    }
  }

  return true;
};
