import {
  ObserverTypes,
  RenderWallet,
  RenderWalletPeerConnect,
  RenderWalletState,
  useAvailableExtensions,
} from "@sundaeswap/sync";
import classNames from "classnames";
import { FC } from "react";

export const ConnectWallet: FC = () => {
  const availableExtensions = useAvailableExtensions();

  return (
    <div className="m-4 w-1/4 border border-gray-400 p-4 flex flex-col">
      <h4>CIP-45</h4>
      <RenderWalletPeerConnect
        render={({ peerConnect, QRCodeElement, activeWallet }) =>
          !activeWallet &&
          peerConnect && (
            <>
              <p>Address: {peerConnect.instance.getAddress()}</p>
              {QRCodeElement}
            </>
          )
        }
      />
      <RenderWallet
        render={({ activeWallet, observer }) => {
          return (
            <select
              value={activeWallet || "default"}
              onChange={async ({ target }) => {
                await observer.connectWallet(
                  target.value as ObserverTypes.TSupportedWalletExtensions
                );
              }}
            >
              <option value={"default"}>Select A Wallet</option>
              {availableExtensions.map(({ name, property }) => (
                <option key={property} value={property}>
                  Connect {name}
                </option>
              ))}
            </select>
          );
        }}
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
        render={({ observer, isCip45, ready }) =>
          ready &&
          !isCip45 && (
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
