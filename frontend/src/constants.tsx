/**
 * Network
 */
export const networks = {
  mainnet: "https://fullnode.mainnet.aptoslabs.com/",
  testnet: "https://fullnode.testnet.aptoslabs.com",
  local: "http://localhost:8080",
};

export type NetworkName = keyof typeof networks;

export const moduleLocations = {
  mainnet: {
    address:
      "0xfbc45a84bd65b000d259ac91a8f314c93313e6d6787dbac71bdaf044f661a4f8",
    name: "canvas_token",
  },
  testnet: {
    address:
      "0x481d6509302e3379b9a8cf524da0000feee18f811d1da7e5addc7f64cdaaac60",
    name: "canvas_token",
  },
  local: {
    address:
      "0xfbc45a84bd65b000d259ac91a8f314c93313e6d6787dbac71bdaf044f661a4f8",
    name: "canvas_token",
  },
};

export const featuredCanvases = {
  mainnet: [],
  testnet: [
    "0x47d85f3e5760ea9dd3eb6eefe7a90304e1ad4e49e38dd6fca8a58f132ae22ad4",
  ],
  local: [],
};

export const indexerUrls = {
  mainnet: "https://indexer-mainnet.gcp.aptosdev.com/v1/graphql",
  testnet: "https://indexer-testnet.staging.gcp.aptosdev.com/v1/graphql",
  local: "none",
};

// Remove trailing slashes
for (const key of Object.keys(networks)) {
  const networkName = key as NetworkName;
  if (networks[networkName].endsWith("/")) {
    networks[networkName] = networks[networkName].slice(0, -1);
  }
}

export const defaultNetworkName: NetworkName = "testnet" as const;

if (!(defaultNetworkName in networks)) {
  throw `defaultNetworkName '${defaultNetworkName}' not in Networks!`;
}

export const defaultNetwork = networks[defaultNetworkName];

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
