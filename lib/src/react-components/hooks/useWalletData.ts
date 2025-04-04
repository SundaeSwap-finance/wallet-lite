import { Cip30WalletApi } from "@cardano-sdk/dapp-connector";
import { IAssetAmountMetadata } from "@sundaeswap/asset";

import { useCallback, useMemo, useState } from "react";
import { useWalletObserver } from "./useWalletObserver";

export interface ISignedData {
  payload: string;
  signature: string;
  key: string;
  rawData: {
    cborKey: string;
    cborSignature: string;
  };
}

export interface ISignDataParams<T = object | string> {
  payload: T;
  signingAddress: string;
  connectedWallet: Cip30WalletApi;
}

export const useWalletData = <
  AssetMetadata extends IAssetAmountMetadata = IAssetAmountMetadata,
>() => {
  const state = useWalletObserver<AssetMetadata>();
  const [signedData, setSignedData] = useState<ISignedData>();

  const signData = useCallback(
    async ({ signingAddress, payload }: ISignDataParams) => {
      if (!state.observer.api) {
        return;
      }

      const [
        { Cardano },
        { Ed25519Signature },
        { COSESign1, COSEKey, Int, BigNum, Label },
      ] = await Promise.all([
        import("@cardano-sdk/core"),
        import("@cardano-sdk/crypto"),
        import("@emurgo/cardano-message-signing-nodejs"),
      ]);

      const response = await state.observer.api.signData(
        Buffer.from(
          Cardano.Address.fromBech32(signingAddress).toBytes(),
        ).toString("hex"),
        Buffer.from(
          typeof payload === "string"
            ? payload
            : JSON.stringify(payload, null, 0),
          "utf-8",
        ).toString("hex"),
      );

      const coseSign1 = COSESign1.from_bytes(
        new Uint8Array(Buffer.from(response.signature, "hex")),
      );
      const keySign = COSEKey.from_bytes(
        new Uint8Array(Buffer.from(response.key, "hex")),
      );
      const labelInt = Int.new_negative(BigNum.from_str("2"));

      const data: ISignedData = {
        payload: Buffer.from(coseSign1.signed_data().to_bytes()).toString(
          "hex",
        ),
        signature: Ed25519Signature.fromBytes(coseSign1.signature()).hex(),
        key: Buffer.from(
          keySign.header(Label.new_int(labelInt))?.as_bytes() || [],
        ).toString("hex"),
        rawData: { cborKey: response.key, cborSignature: response.signature },
      };

      setSignedData(data);
      return data;
    },
    [state.observer.api],
  );

  return useMemo(
    () => ({
      signData,
      signedData,
    }),
    [signData, signedData],
  );
};
