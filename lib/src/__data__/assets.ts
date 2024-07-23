import { AssetAmount } from "@sundaeswap/asset";
import { normalizeAssetIdWithDot } from "../utils/assets";

export const assetIds = [
  "ada.lovelace",
  "04b95368393c821f180deee8229fbd941baaf9bd748ebcdbf7adbb147273455247",
  "063bbb14b22e39aedf7beba84d7ce9ea771a6f19d9ad02f70d6f3eaa446973636f536f6c6172697345787472617330313431",
  "063bbb14b22e39aedf7beba84d7ce9ea771a6f19d9ad02f70d6f3eaa446973636f536f6c6172697345787472617339303038",
  "0cf7296fe09e9225d8cc0a444ee60e8d4f09c1c5f3dbc8aaee1ebc705448554e54",
  "1088b361c41f49906645cedeeb7a9ef0e0b793b1a2d24f623ea748764861766f63576f726c647336393339",
  "2b7e1c65b836affa518d0a63067e52962c37e0485cf28edcd970bff676424f4f4b",
  "2d3b299285e911a6dddb915d03d47970a45cb0a08aa8a138dba39c6f4b4a4232393932",
  "3059f54ae7c2d56237bd921a864eb090d7d0c98b2775f9784f854fdd72434f5049",
  "3e9499856b0421b4424c8fc3a75c4e05aadab5e05f1337304efb6c1f53505f6b55325a4164",
  "41142faeb5e3c644625966715c0a844bb4d6aeef2bcdbf535b14e5a57448414e444c45",
  "46e607b3046a34c95e7c29e47047618dbf5e10de777ba56c590cfd5c4e45574d5f31",
  "477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202336393232",
  "477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202337393130",
  "477cec772adb1466b301fb8161f505aa66ed1ee8d69d3e7984256a43477574656e62657267204269626c65202339313538",
  "51a5e236c4de3af2b8020442e2a26f454fda3b04cb621c1294a0ef34424f4f4b",
  "5c1abfb2c2b2a4ce2fa731cdb2f793fcd4ab2c2c05b8ee39b142a4a64d694c4b3630",
  "6a10a650be925743cb0e5592442326dd1094e107b1b0402c13160ebd446973636f696e45617272696e673335",
  "76dbbc78587bf972c710f22a0807a6905a8a5e713418515fc9abeed1646973636f736f6c617269733038393233",
  "7f9a722eac5d460444e4df7e65144785e7f16de8579c00663232879c4e49444f57415645303831",
  "8d7526784ef72fe0ccdd085976ada0da88e7fb013e38e794b09233414245415244",
  "9293316c91ff5143e3bc60d78d44dfb87edff59d61b99cf4c938d9084142544e",
  "92a7b9d9d8e6111ca2105409e0f0efea9661d2a0bd44e322253420b453505f354956317337",
  "9460f3352773623741fcf6fd471668998021c3ebb805413c80e9b43941424f4f4b",
  "960d6f6cb6d3f8d9746bff157000ca71ed1c8cc419fff09796ee9e8a4d694c4b44726f707a20315f3236",
  "a0028f350aaabe0545fdcb56b039bfb08e4bb4d8c4d7c3c7d481c235484f534b59",
  "a706fc87764cde4ac018c38bf61630c1065932db49e6f495be3b29f8436f636f4c6f636f477265656e50616c6d53314e465431363537",
  "ad14d754d349ac1a6cbd3e08d404e67bc5b3ab265884736a5bf07eb05448554e54",
  "ae1b29e34cb98ca4e02011a2b2c465261ae9805a1e256c41647a952072424f4f4b",
  "b6a7467ea1deb012808ef4e87b5ff371e85f7142d7b356a40d9b42a0436f726e75636f70696173205b76696120436861696e506f72742e696f5d",
  "bf5aebb0481d3b0031eac8b495808235f7d5f252421504e64f3729dd4d494e544b4559",
  "c117f33edeee4b531dfdb85ead5753433c9dbd875629bc971013ffac42656174426f792023343136",
  "c117f33edeee4b531dfdb85ead5753433c9dbd875629bc971013ffac42656174426f79202331383334",
  "c117f33edeee4b531dfdb85ead5753433c9dbd875629bc971013ffac42656174426f79202332363237",
  "c117f33edeee4b531dfdb85ead5753433c9dbd875629bc971013ffac42656174426f79202336343934",
  "c281975562f394761771f13f599881517fa8455946e7e30454de22da474f415454726962653034313736",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697331313738",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697331343434",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697331363037",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697331373030",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697331383538",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697332333938",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697332343734",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697332353239",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697332353837",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697332393635",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697333303938",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697333323235",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697334303031",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697334323638",
  "d0112837f8f856b2ca14f69b375bc394e73d146fdadcc993bb993779446973636f536f6c6172697334343533",
  "d1218edd90bd8446051a22d043b4cc7369ad48be46299528f8b22c487241584f",
  "d55bf9d2ad12cc55e4ed29d97c64dba0e4905d3c80f800449f3d51f04368616e6765",
  "df6268fb872b81a349469825c23bd4d0f5fb4b35bcba547493b35fd6446f78786f536f6c6172697330313431",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36976",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3666171",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3666472",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe368756773",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d696e69",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe372656b74",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe377656233",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36269703339",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3636f2d6f70",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3656964616e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36761746573",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe374616e7961",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3647275646765",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe366696e6c6579",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36b6f65706b65",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d616b657273",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d6f6465726e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe373796e746178",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe37a656b696168",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3636176656d616e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe364697372757074",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3656e6372797074",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe368757362616e64",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36d696e696d616c",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe370726f66696c65",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe370757273756974",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3736176696e6773",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3616c64657262696e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe362726577636c7562",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36f726967696e616c",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3706c61793277696e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe37072656d69657265",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3646179747261646572",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe363687269737469616e6e",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3706f7274666f6c696f31",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3706f7274666f6c696f32",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3706f7274666f6c696f33",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe373756666696369656e74",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe373757270726973656d65",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36f70706f7274756e697374",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3736f6c6f7072656e657572",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3737572766976616c697374",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe374686562726577636c7562",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe36472756467657265706f7274",
  "8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe368617070796e657779656172",
  "f55ac9646c45e899603a5617d398570705fd7b93278a6e4879136f954d6f6f6e6c69676874313834",
  "f55ac9646c45e899603a5617d398570705fd7b93278a6e4879136f954d6f6f6e6c69676874313937",
  "f55ac9646c45e899603a5617d398570705fd7b93278a6e4879136f954d6f6f6e6c69676874323237",
  "f66d78b4a3cb3d37afa0ec36461e51ecbde00f26c8f0a68f94b6988069425443",
];

export const assetMap = assetIds.map((id) => {
  const assetId = normalizeAssetIdWithDot(id);
  const name = Buffer.from(id.slice(56), "hex").toString("utf-8");

  const nftMetadata = {
    decimals: 0,
    assetId,
    name,
  };

  const fungibleMetadata = {
    ...nftMetadata,
    decimals: 6,
  };

  const isNFT =
    id.includes("8d18d786e92776c824607fd8e193ec535c79dc61ea2405ddf3b09fe3") ||
    name.includes("Gutenberg Bible");

  return {
    key: assetId,
    assetAmount: new AssetAmount(
      isNFT ? 1 : Math.floor(Math.random() * 10000000) + 1,
      isNFT ? nftMetadata : fungibleMetadata,
    ),
  };
});
