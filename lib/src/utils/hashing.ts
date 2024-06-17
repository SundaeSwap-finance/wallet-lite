import { EventTypes } from "../index.js";

/**
 * Generates a unique key for the event and callback function.
 *
 * @template E - The event type.
 * @param {E} event - The event type.
 * @param {TWalletObserverEventFunction<E>} callback - The callback function.
 * @returns {string} - The unique key for the event and callback.
 */
export const getEventKey = <
  E extends keyof EventTypes.EWalletObserverEventValues
>(
  event: E,
  callback: EventTypes.TWalletObserverEventFunction<E>
): string => {
  return `${event}-${getFunctionHash(callback)}`;
};

/**
 * Generates a hash for the callback function.
 *
 * @template E - The event type.
 * @param {TWalletObserverEventFunction<E>} callback - The callback function.
 * @returns {number} - The hash of the callback function.
 */
export const getFunctionHash = <
  E extends keyof EventTypes.EWalletObserverEventValues
>(
  callback: EventTypes.TWalletObserverEventFunction<E>
): number => {
  const str = `${callback.name}${callback.toString()}`.replace(/\s+/g, "");
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
};
