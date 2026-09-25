import { Cip30WalletApi } from "@cardano-sdk/dapp-connector";

import { ReadOnlyProvider } from "./ReadOnlyProvider.Abstract.class.js";

export class ReadOnlyApi implements Cip30WalletApi {
  address: string;
  network: 0 | 1;
  provider: ReadOnlyProvider;

  constructor(address: string, network: 0 | 1, provider: ReadOnlyProvider) {
    this.address = address;
    this.provider = provider;
    this.network = network;
  }

  getBalance = async () => {
    return this.provider.getBalance(this.address, this.network);
  };

  getChangeAddress = async () => {
    // Imported here, not at module scope. @cardano-sdk/core is large and only
    // these two address helpers need it, so a consumer that never builds a
    // read-only wallet does not pay for it in the bundle.
    const { Cardano } = await import("@cardano-sdk/core");
    return Cardano.Address.fromBech32(this.address).toBytes();
  };

  getCollateral = async () => {
    return [];
  };

  getExtensions = async () => {
    return [];
  };

  getNetworkId = async () => {
    return this.network;
  };

  getRewardAddresses = async () => {
    return [];
  };

  getUnusedAddresses = async () => {
    return [];
  };

  getUsedAddresses = async () => {
    const { Cardano } = await import("@cardano-sdk/core");
    const address = Cardano.Address.fromBech32(this.address);
    return [address.toBytes()];
  };

  getUtxos = async () => {
    return this.provider.getUtxos(this.address, this.network);
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
