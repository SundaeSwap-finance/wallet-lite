// import { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { mockedEternlWallet } from "../../../../setup-tests.js";
import {
  IWalletObserverProviderProps,
  useAvailableExtensions,
  WalletObserverProvider,
} from "../../../index.js";

const REFRESH_INTERVAL = 10;

describe("useAvailableExtensions", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(REFRESH_INTERVAL), {
      wrapper: (props) => <WalletObserverProvider {...props} />,
    });

    expect(result.current).toEqual([
      { name: "Eternl", property: "eternl", reference: mockedEternlWallet },
    ]);

    await act(async () => {
      // Inject a duplicate api.
      window.cardano = {
        ...window.cardano,
        flint: mockedEternlWallet as unknown as any,
      };

      // Wait 10 milliseconds for interval to catch.
      await new Promise((res) => setTimeout(res, REFRESH_INTERVAL));
    });

    expect(result.current).toEqual([
      {
        name: "Eternl",
        property: "eternl",
        reference: mockedEternlWallet,
      },
      {
        name: "Eternl",
        property: "flint",
        reference: mockedEternlWallet,
      },
    ]);
  });
});
