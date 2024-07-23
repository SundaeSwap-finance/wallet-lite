import { describe, expect, test } from "bun:test";

import { EWalletObserverEvents } from "../../@types/events.js";
import { getEventKey, getFunctionHash } from "../hashing.js";

describe("hashing functions", () => {
  test("getFunctionHash", () => {
    const result = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          break;
        }
      }
    });

    expect(result).toEqual(879701364);

    const result2 = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 6) {
          break;
        }
      }
    });

    expect(result2).toEqual(2676966711);

    const result3 = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          break;
        }
      }
    });

    expect(result3).toEqual(879701364);

    const result4 = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          break;
        }
      }
    });

    expect(result4).toEqual(879701364);
  });

  test("getEventKey", () => {
    const callback = () => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          break;
        }
      }
    };

    const hash = getFunctionHash(callback);

    const result1 = getEventKey(
      EWalletObserverEvents.CONNECT_WALLET_END,
      callback,
    );
    expect(result1).toEqual(
      `${EWalletObserverEvents.CONNECT_WALLET_END}-${hash}`,
    );
  });
});
