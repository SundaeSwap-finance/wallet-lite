import type { BlockFrostAPI, Responses } from "@blockfrost/blockfrost-js";
import { Cardano, Serialization } from "@cardano-sdk/core";
import { Hash32ByteBase16 } from "@cardano-sdk/crypto";

import { HexBlob } from "@cardano-sdk/util";
import { ReadOnlyProvider } from "./ReadOnlyProvider.Abstract.class.js";

export class ReadOnlyBlockfrostProvider implements ReadOnlyProvider {
  blockfrostProjectId: string;
  api?: BlockFrostAPI;

  constructor(blockfrostProjectId: string) {
    this.blockfrostProjectId = blockfrostProjectId;
  }

  private __networkName(network: 0 | 1): string {
    if (network === 1) return "mainnet";
    if (this.blockfrostProjectId.startsWith("preprod")) return "preprod";
    return "preview";
  }

  async getBalance(address: string, network: 0 | 1) {
    const response = await fetch(
      `https://cardano-${this.__networkName(network)}.blockfrost.io/api/v0/addresses/${address}`,
      {
        headers: {
          project_id: this.blockfrostProjectId,
        },
      },
    );

    const result = await response.json();

    if (!response.ok || "error" in result) {
      throw new Error(
        `Blockfrost getBalance failed: ${result.message || result.error || response.statusText}`,
      );
    }

    // Build our value.
    const value = this.__getValueFromAmount(
      (result as Responses["address_content"]).amount,
    );

    // Return the cbor.
    return value.toCbor();
  }

  async getUtxos(address: string, network: 0 | 1) {
    const allResults: Responses["address_utxo_content"] = [];
    let page = 1;

    while (true) {
      const response = await fetch(
        `https://cardano-${this.__networkName(network)}.blockfrost.io/api/v0/addresses/${address}/utxos?page=${page}`,
        {
          headers: {
            project_id: this.blockfrostProjectId,
          },
        },
      );

      const result = await response.json();

      if (!response.ok || "error" in result) {
        throw new Error(
          `Blockfrost getUtxos failed: ${result.message || result.error || response.statusText}`,
        );
      }

      const items = result as Responses["address_utxo_content"];
      if (items.length === 0) break;
      allResults.push(...items);
      page++;
    }

    const formatted = allResults.map((r) => {
      return Serialization.TransactionUnspentOutput.fromCore([
        Serialization.TransactionInput.fromCore({
          index: r.output_index,
          txId: Cardano.TransactionId(r.tx_hash),
        }).toCore(),
        Serialization.TransactionOutput.fromCore({
          address: Cardano.PaymentAddress(r.address),
          value: this.__getValueFromAmount(r.amount).toCore(),
          datum: r.inline_datum
            ? Serialization.PlutusData.fromCbor(
                HexBlob(r.inline_datum),
              ).toCore()
            : undefined,
          datumHash: r.data_hash ? Hash32ByteBase16(r.data_hash) : undefined,
        }).toCore(),
      ]).toCbor();
    });

    return formatted;
  }

  private __getValueFromAmount(amount?: { unit: string; quantity: string }[]) {
    if (!amount) {
      amount = [
        {
          unit: "lovelace",
          quantity: "0",
        },
      ];
    }

    const lovelace = amount.find((a) => a.unit === "lovelace");
    const assets = amount.filter((a) => a.unit !== "lovelace");

    // Build our token map.
    const tokenMap = new Map<Cardano.AssetId, bigint>();
    assets.forEach((asset) => {
      const matchingEntry = tokenMap.get(Cardano.AssetId(asset.unit)) || 0n;
      tokenMap.set(
        Cardano.AssetId(asset.unit),
        BigInt(asset.quantity) + matchingEntry,
      );
    });

    // Build our value.
    const value = Serialization.Value.fromCore({
      coins: BigInt(lovelace?.quantity || 0),
      assets: tokenMap,
    });

    return value;
  }
}
