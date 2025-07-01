import { Cardano } from "@cardano-sdk/core";
import { Cip30WalletApi } from "@cardano-sdk/dapp-connector";

export class CustomWalletApi implements Cip30WalletApi {
  constructor(public address: string) {}

  getBalance = async () => {
    throw new Error("not implemented");
  };

  getChangeAddress = async () => {
    return Cardano.Address.fromBech32(this.address).toBytes().toString();
  };

  getCollateral = async () => {
    return [];
  };

  getExtensions = async () => {
    return [];
  };

  getNetworkId = async () => {
    return this.address.startsWith("addr_test") ? 0 : 1;
  };

  getRewardAddresses = async () => {
    return [];
  };

  getUnusedAddresses = async () => {
    return [];
  };

  getUsedAddresses = async () => {
    return [Cardano.Address.fromBech32(this.address).toBytes().toString()];
  };

  getUtxos = async () => {
    return [];
  };

  signData = async () => {
    throw new Error("not implemented");
  };

  signTx = async () => {
    throw new Error("not implemented");
  };

  submitTx = async () => {
    throw new Error("not implemented");
  };
}
