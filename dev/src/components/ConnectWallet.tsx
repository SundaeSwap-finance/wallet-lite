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
  const [selectedWallet, setSelectedWallet] = useState<string>("default");
  const [customWallet, setCustomWallet] = useState<string>();

  return (
    <div className="m-4 w-1/4 border border-gray-400 p-4 flex flex-col">
      <RenderWallet
        render={({ connectWallet }) => {
          return (
            <>
              <select
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value={"default"}>Select A Wallet</option>
                {[
                  ...availableExtensions,
                  { name: "Custom", property: "custom" },
                ].map(({ name, property }) => (
                  <option key={property} value={property}>
                    Connect {name}
                  </option>
                ))}
              </select>
              {selectedWallet === "custom" && (
                <input
                  className="mt-2"
                  placeholder="addr_test..."
                  type="text"
                  value={customWallet}
                  onChange={(e) => setCustomWallet(e.target.value)}
                />
              )}
              <button
                onClick={async () => {
                  await connectWallet(
                    selectedWallet === "custom" && customWallet
                      ? customWallet
                      : selectedWallet,
                  );
                }}
              >
                Connect Wallet
              </button>
            </>
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
