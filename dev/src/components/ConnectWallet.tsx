import {
  RenderWallet,
  RenderWalletPeerConnect,
  RenderWalletState,
  useAvailableExtensions,
} from "@sundaeswap/wallet-lite";
import classNames from "classnames";
import { FC, useState } from "react";

export const ConnectWallet: FC = () => {
  const availableExtensions = useAvailableExtensions();
  const [selectedWallet, setSelectedWallet] = useState<string>();
  const [customWallet, setCustomWallet] = useState<string>();

  return (
    <div className="m-4 w-1/4 border border-gray-400 p-4 flex flex-col">
      <RenderWallet
        render={({ connectWallet }) => {
          return (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <select
                className="w-1/2"
                value={selectedWallet || "default"}
                onChange={async ({ target }) => {
                  setCustomWallet(undefined);
                  setSelectedWallet(target.value);
                }}
              >
                <option value={"default"}>Select A Wallet</option>
                {availableExtensions.map(({ name, property }) => (
                  <option key={property} value={property}>
                    {name}
                  </option>
                ))}
              </select>
              <input
                className="w/1-2"
                placeholder="Read-only address..."
                type="text"
                onChange={(e) => setCustomWallet(e.target.value)}
                value={customWallet}
              />
              <button
                className={classNames(
                  {
                    "text-gray-400 cursor-not-allowed":
                      !selectedWallet && !customWallet,
                  },
                  {
                    "text-white cursor-pointer": selectedWallet || customWallet,
                  },
                  "w-full ml-auto bg-black px-4 py-2",
                )}
                disabled={!selectedWallet && !customWallet}
                onClick={() => {
                  if (selectedWallet || customWallet) {
                    connectWallet((selectedWallet || customWallet) as string);
                  }
                }}
              >
                Connect Wallet
              </button>
            </div>
          );
        }}
      />
      <h4>CIP-45</h4>
      <RenderWalletPeerConnect
        render={({ activeWallet, peerConnect, QRCodeElement }) =>
          !activeWallet &&
          peerConnect && (
            <>
              <p>Address: {peerConnect.instance.getAddress()}</p>
              {QRCodeElement}
            </>
          )
        }
      />
      <div className="flex items-center">
        <p>
          <strong>
            Wallet State:{" "}
            <RenderWalletState
              render={({
                connectingWallet,
                syncingWallet,
                switching,
                ready,
              }) => {
                if (switching) {
                  return "Switching wallets...";
                }

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
      <RenderWalletState
        render={({ isCip45, ready, disconnect }) =>
          ready &&
          !isCip45 && (
            <input
              className={classNames(
                "ml-auto cursor-pointer bg-gray-400 px-4 py-2",
              )}
              type="button"
              value={"Disconnect"}
              onClick={disconnect}
            />
          )
        }
      />

      <RenderWallet
        render={({ stakeAddress, mainAddress }) => (
          <div>
            <span className="block text-xs overflow-hidden text-ellipsis text-nowrap">
              Stake Address: {stakeAddress}
            </span>
            <span className="block text-xs overflow-hidden text-ellipsis text-nowrap">
              Main Address: {mainAddress}
            </span>
          </div>
        )}
      />
    </div>
  );
};
