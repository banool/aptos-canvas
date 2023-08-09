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
      "0xf3946c9408beecf8b37e441113c4ad3fd3752b9bed03a8a63764304edfdb3162",
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
  mainnet: [
    "0x590fe948b80099697089268b8d3136b6cecdc243fd39eb0272cda050024770ff",
  ],
  testnet: [
    "0xb693adc2b70c693019217e95b539a7a3fdd92a033dc491745c0d3ec464807fb1",
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
