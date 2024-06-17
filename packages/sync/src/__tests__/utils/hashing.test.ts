import { describe, expect, test } from "bun:test";

import { EWalletObserverEvents } from "../../@types/events";
import { getEventKey, getFunctionHash } from "../../utils/hashing";

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

    const result3 = getFunctionHash((param) => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          console.log(param);
          break;
        }
      }
    });

    expect(result3).toEqual(1148379925);

    const result4 = getFunctionHash((params) => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          console.log(params);
          break;
        }
      }
    });

    expect(result4).toEqual(1677458229);
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
      callback
    );
    expect(result1).toEqual(
      `${EWalletObserverEvents.CONNECT_WALLET_END}-${hash}`
    );
  });
});
