import { TAddressDetails } from "../@types/utils.js";
import { getCardanoCore } from "../utils/getLibs.js";

export class WalletObserverUtils {
  private constructor(
    public network: number,
    public Cardano: typeof import("@cardano-sdk/core").Cardano
  ) {}

  static async new(network: number): Promise<WalletObserverUtils> {
    const cardano = await getCardanoCore().then(({ Cardano }) => Cardano);
    return new this(network, cardano);
  }

  setNetwork(val: number): WalletObserverUtils {
    this.network = val;
    return this;
  }

  getAddressDetails(address: string): TAddressDetails {
    if (!this.Cardano.Address.isValidBech32(address)) {
      throw new Error("Expected a Bech32 encoded address.");
    }

    const Address = this.Cardano.BaseAddress.fromAddress(
      this.Cardano.Address.fromBech32(address)
    );

    return {
      paymentCredential: Address?.getPaymentCredential(),
      stakingCredential: Address?.getStakeCredential(),
    };
  }

  getBech32StakingAddress(address: string): string | undefined {
    const { stakingCredential } = this.getAddressDetails(address);
    if (!stakingCredential) {
      return undefined;
    }

    const stakingAddress = this.Cardano.RewardAddress.fromCredentials(
      this.network,
      stakingCredential
    );
    return stakingAddress.toAddress().toBech32();
  }
}
