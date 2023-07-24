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
      "0x81e2e2499407693c81fe65c86405ca70df529438339d9da7a6fc2520142b591e",
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
    "0xa7b52eb38f27f7bc1721ccb329de8c4bb969ea39992e1c2a1d4a2d9661b53251",
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

export const defaultNetworkName: NetworkName = "mainnet" as const;

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
