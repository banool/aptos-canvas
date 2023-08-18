/**
 * Network
 */
export type NetworkName = keyof typeof networkInfo;

export type NetworkInfo = (typeof networkInfo)[NetworkName];

export const networkInfo = {
  mainnet: {
    module_address:
      "0x5047733bb1360184c72e42fabb906a614cc547d751fc5764d2f74c9fd723035a",
    node_api_url: "https://fullnode.mainnet.aptoslabs.com",
    processor_url: "https://mainnet.graffio.art",
    featured_canvases: [
      "0x590fe948b80099697089268b8d3136b6cecdc243fd39eb0272cda050024770ff",
    ],
    pntMetadataAddress: "todo",
  },
  testnet: {
    module_address:
      "0x5047733bb1360184c72e42fabb906a614cc547d751fc5764d2f74c9fd723035a",
    node_api_url: "https://fullnode.testnet.aptoslabs.com",
    processor_url: "https://testnet.graffio.art",
    featured_canvases: [
      "0x0aa11d8210439b66a3bb4d2f571659548ab302286e820a763baf827c1abd3165",
    ],
    pntMetadataAddress:
      "0xfc09cf257b28e239a02ee938045f0a93c97e86c233f1a051974a9d08b21a339f",
  },
  local: {
    module_address:
      "0xfbc45a84bd65b000d259ac91a8f314c93313e6d6787dbac71bdaf044f661a4f8",
    processor_url: "http://localhost:8080",
    indexer_url: "http://127.0.0.1:7645",
    featured_canvases: [],
    pntMetadataAddress: "todo",
  },
};

export const defaultNetworkName = "mainnet" as const;

export const defaultNetworkInfo = networkInfo[defaultNetworkName];

/**
 * Feature
 */
export const features = {
  prod: "Production Mode",
  dev: "Development Mode",
};

export type FeatureName = keyof typeof features;

// Remove trailing slashes
for (const key of Object.keys(features)) {
  const featureName = key as FeatureName;
  if (features[featureName].endsWith("/")) {
    features[featureName] = features[featureName].slice(0, -1);
  }
}

export const defaultFeatureName: FeatureName = "prod" as const;

if (!(defaultFeatureName in features)) {
  throw `defaultFeatureName '${defaultFeatureName}' not in Features!`;
}

export const defaultFeature = features[defaultFeatureName];
