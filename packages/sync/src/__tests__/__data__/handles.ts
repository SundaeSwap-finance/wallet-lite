import type { IHandle } from "@koralabs/adahandle-sdk";
import { Rarity } from "@koralabs/handles-public-api-interfaces";

export const mockHandleMetadata: IHandle[] = [
  {
    // For testing purposes, we make the hex name match a mock asset ID.
    hex: "6d696e696d616c",
    name: "calvin",
    image: "ipfs://zdj7We5kz4op3HNodbzfRt14AqUJdygK2gHosAnbaDx7fGck2",
    standard_image: "ipfs://zb2rhenCxDXo56r7AwHsHuSBmK9x63diFzwxtsL6PsQnM3uUs",
    holder: "stake1uyyyruv2y289xm7laay8a9sgrn95q627q3q4v3z4eagjdrs4j0yqu",
    holder_type: "wallet",
    length: 6,
    og_number: 0,
    rarity: Rarity.common,
    utxo: "3911b59931d3f5e938bef6d773d4b0d6a48fab96d63c658aa4b240a50dcba679#1",
    characters: "letters",
    numeric_modifiers: "",
    default_in_wallet: "cal",
    pfp_image: "",
    bg_image:
      "ipfs://bafybeicuvareow6exu2ti6xtsxkzpcpsc7dj54q7oaratjm4uaqgd77ham",
    bg_asset:
      "c705d66dd826fa750a3fcc0a74c27fdb20db2ed18ad569232d7123ad001bc2804772616469656e7420536861706573202d2043616765",
    resolved_addresses: {
      ada: "addr1qyzpu6dy0tp926q72qdsxmu3ydqg9qyavs7tanfcpudv24sgg8cc5g5w2dhalm6g06tqs8xtgp54upzp2ez9tn63y68qn5st78",
    },
    created_slot_number: 103834977,
    updated_slot_number: 115852137,
    has_datum: false,
    svg_version: "2.4.0",
    image_hash:
      "0291cbb9f046a27bb067b4310c6eab6ae8e755a49a3b7e1ae87314b569ab6548",
    standard_image_hash:
      "78e558e2c32e3de4e95cefad00857a98665cd323bf11bdd4b9b48a707de61910",
    version: 1,
  },
  {
    // For testing purposes, we make the hex name match a mock asset ID.
    hex: "62726577636c7562",
    name: "pi",
    image: "ipfs://QmYKjoA9fsLaGnz92BJbC5kHFsSKsijAdmowQqbmzjfWBT",
    standard_image: "ipfs://QmYKjoA9fsLaGnz92BJbC5kHFsSKsijAdmowQqbmzjfWBT",
    holder: "stake1u8q07kgyuhffc8v9auvn4jlqcm4hehdu7wsd9fvna95nr3qynl7dk",
    holder_type: "wallet",
    length: 2,
    og_number: 0,
    rarity: Rarity.ultra_rare,
    utxo: "8ae62ab3631124197cdd4faac83428c404e529f07db510899c68a373a22fa77c#1",
    characters: "letters",
    numeric_modifiers: "",
    default_in_wallet: "pi",
    pfp_image: "",
    bg_image: "",
    resolved_addresses: {
      ada: "addr1qyyrwcs73wk9cp9e7lxpn86d2n4wxgyduxqxmmj6psmjejkqlavsfewjnswctmce8t97p3ht0nwmeuaq62je86tfx8zq6lh9kr",
    },
    created_slot_number: 55725690,
    updated_slot_number: 104951843,
    has_datum: false,
    svg_version: "",
    image_hash: "",
    standard_image_hash: "",
    version: 0,
  },
];
