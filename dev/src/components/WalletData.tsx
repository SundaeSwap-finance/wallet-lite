import { AssetAmount } from "@sundaeswap/asset";
import { RenderWallet } from "@sundaeswap/wallet-lite";
import { useState } from "react";

import { IWalletMetadata } from "../App";
import { WalletHandles } from "./WalletHandles";

export const WalletData = () => {
  const [visibleHandles, setVisibleHandles] = useState(true);

  return (
    <div>
      <h4 className="text-xl font-bold">ADA Balance</h4>
      <RenderWallet<IWalletMetadata>
        render={({ adaBalance }) => {
          return <p>{adaBalance.value.toString()}</p>;
        }}
      />
      <div className="grid w-full grid-cols-2">
        <div>
          <h4 className="text-xl font-bold">Native Assets</h4>
          <ul>
            <RenderWallet
              render={({ balance }) => {
                return Array.from(balance).map(([key, aa]) => (
                  <li key={key}>
                    {aa.metadata.assetName || aa.metadata.assetId}:{" "}
                    {aa.value.toString()}
                  </li>
                ));
              }}
            />
          </ul>

          <h4 className="text-xl font-bold">UTXOS</h4>
          <ul>
            <RenderWallet<IWalletMetadata>
              render={({ utxos }) => {
                return utxos?.map(({ input, output }) => (
                  <li
                    key={`utxos-${input().transactionId()}-${input().index()}`}
                  >
                    <strong>Hash</strong>:{" "}
                    {`${input().transactionId()}#${input().index()}`}
                    <br />
                    <strong>ADA</strong>:{" "}
                    {new AssetAmount(output().amount().coin(), {
                      assetId: "ada.lovelace",
                      decimals: 6,
                    }).value.toString()}
                  </li>
                ));
              }}
            />
          </ul>

          <h4 className="text-xl font-bold">Collateral</h4>
          <ul>
            <RenderWallet<IWalletMetadata>
              render={({ collateral }) => {
                return collateral?.map(({ input, output }) => (
                  <li
                    key={`collateral-${input().transactionId()}-${input().index()}`}
                  >
                    <strong>Hash</strong>:{" "}
                    {`${input().transactionId()}#${input().index()}`}
                    <br />
                    <strong>ADA</strong>:{" "}
                    {new AssetAmount(output().amount().coin(), {
                      assetId: "ada.lovelace",
                      decimals: 6,
                    }).value.toString()}
                  </li>
                ));
              }}
            />
          </ul>
        </div>
        <div>
          <button onClick={() => setVisibleHandles((prv) => !prv)}>
            Toggle Visibilty
          </button>
          {visibleHandles && <WalletHandles />}
        </div>
      </div>
    </div>
  );
};
