import { act } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { describe, expect, it } from "bun:test";

import { Cip30Wallet } from "@cardano-sdk/dapp-connector";
import { mockedEternlWallet } from "../../../../../../setup-tests";
import { useAvailableExtensions } from "../../../exports";
import {
  IWalletObserverProviderProps,
  WalletObserverProvider,
} from "../../../exports/react-components";

const REFRESH_INTERVAL = 10;

describe("useAvailableExtensions", () => {
  it("should correctly retrieve the instance", async () => {
    const { result } = renderHook<
      IWalletObserverProviderProps,
      ReturnType<typeof useAvailableExtensions>
    >(() => useAvailableExtensions(REFRESH_INTERVAL), {
      wrapper: (props) => <WalletObserverProvider {...props} />,
    });

    expect(result.current).toEqual([{ name: "Eternl", property: "eternl" }]);

    await act(async () => {
      // Inject a duplicate api.
      window.cardano = {
        ...window.cardano,
        flint: mockedEternlWallet as unknown as Cip30Wallet,
      };

      // Wait 10 milliseconds for interval to catch.
      await new Promise((res) => setTimeout(res, REFRESH_INTERVAL));
    });

    expect(result.current).toEqual([
      {
        name: "Eternl",
        property: "eternl",
      },
      {
        name: "Eternl",
        property: "flint",
      },
    ]);
  });
});
