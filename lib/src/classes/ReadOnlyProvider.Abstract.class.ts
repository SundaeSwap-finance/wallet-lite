export abstract class ReadOnlyProvider {
  abstract getBalance: (address: string, network: 0 | 1) => Promise<string>;
  abstract getUtxos: (address: string, network: 0 | 1) => Promise<string[]>;
}
