import { Cardano } from "@cardano-sdk/core";
import { Cip30WalletApi } from "@cardano-sdk/dapp-connector";

export class ReadOnlyApi implements Cip30WalletApi {
  address: string;

  constructor(address: string) {
    this.address = address;
  }

  getBalance = async () => {
    throw new Error("not implemented");
  };

  getChangeAddress = async () => {
    return Cardano.Address.fromBech32(this.address).toBytes();
  };

  getCollateral = async () => {
    return [];
  };

  getExtensions = async () => {
    return [];
  };

  getNetworkId = async () => {
    return this.address.startsWith("addr_") ? 1 : 0;
  };

  getRewardAddresses = async () => {
    return [];
  };

  getUnusedAddresses = async () => {
    return [];
  };

  getUsedAddresses = async () => {
    return [];
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
