import { describe, expect, test } from "bun:test";

import { EWalletObserverEvents } from "../../exports";
import { getEventKey, getFunctionHash } from "../hashing";

describe("hashing functions", () => {
  test("getFunctionHash", () => {
    const result = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          break;
        }
      }
    });

    expect(result).toEqual(240412116);

    const result2 = getFunctionHash(() => {
      for (let i = 0; i < 20; i++) {
        if (i > 6) {
          break;
        }
      }
    });

    expect(result2).toEqual(1481802071);

    const result3 = getFunctionHash((param) => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          console.log(param);
          break;
        }
      }
    });

    expect(result3).toEqual(2915598005);

    const result4 = getFunctionHash((params) => {
      for (let i = 0; i < 20; i++) {
        if (i > 5) {
          console.log(params);
          break;
        }
      }
    });

    expect(result4).toEqual(249212949);
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
