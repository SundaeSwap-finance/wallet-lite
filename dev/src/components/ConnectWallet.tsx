import {
  TSupportWalletExtensions,
  useAvailableExtensions,
} from "@sundaeswap/sync";
import {
  RenderWallet,
  RenderWalletState,
} from "@sundaeswap/sync/react-components";
import classNames from "classnames";
import { FC, useEffect } from "react";

export const ConnectWallet: FC = () => {
  const availableExtensions = useAvailableExtensions();

  useEffect(() => {
    console.log("rendering connect wallet");
  });

  return (
    <div className="flex items-center gap-4">
      <RenderWallet
        render={({ activeWallet, observer }) => (
          <select
            value={activeWallet || "default"}
            onChange={async ({ target }) => {
              await observer.connectWallet(
                target.value as TSupportWalletExtensions
              );
            }}
          >
            {!activeWallet && (
              <option disabled value={"default"}>
                Select A Wallet
              </option>
            )}
            {availableExtensions.map(({ name, property }) => (
              <option key={property} value={property}>
                Connect {name}
              </option>
            ))}
          </select>
        )}
      />
      <div className="flex items-center">
        <p>
          <strong>
            Wallet State:{" "}
            <RenderWalletState
              render={({ connectingWallet, syncingWallet, ready }) => {
                if (connectingWallet) {
                  return "Connecting wallet...";
                }

                if (syncingWallet) {
                  return "Syncing wallet...";
                }

                if (ready) {
                  return "Connected!";
                }

                return "Disconnected";
              }}
            />
          </strong>
        </p>
      </div>
      <RenderWallet
        render={({ activeWallet, observer }) =>
          activeWallet && (
            <input
              className={classNames(
                "ml-auto cursor-pointer bg-gray-400 px-4 py-2"
              )}
              type="button"
              value={"Disconnect"}
              onClick={observer.disconnect}
            />
          )
        }
      />
    </div>
  );
};
