import {
  RenderWallet,
  TRenderWalletFunctionState,
} from "@sundaeswap/wallet-lite";

import { AssetAmount } from "@sundaeswap/asset";
import { IWalletMetadata } from "../App";
import { WalletHandles } from "./WalletHandles";

export const WalletData = () => {
  return (
    <div>
      <h4 className="text-xl font-bold">ADA Balance</h4>
      <RenderWallet
        render={({
          adaBalance,
        }: TRenderWalletFunctionState<IWalletMetadata>) => {
          return <p>{adaBalance.value.toString()}</p>;
        }}
      />
      <div className="grid w-full grid-cols-2">
        <div>
          <h4 className="text-xl font-bold">Native Assets</h4>
          <ul>
            <RenderWallet
              render={({
                balance,
              }: TRenderWalletFunctionState<IWalletMetadata>) => {
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
            <RenderWallet
              render={({
                utxos,
              }: TRenderWalletFunctionState<IWalletMetadata>) => {
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
            <RenderWallet
              render={({
                collateral,
              }: TRenderWalletFunctionState<IWalletMetadata>) => {
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
          <WalletHandles />
        </div>
      </div>
    </div>
  );
};
