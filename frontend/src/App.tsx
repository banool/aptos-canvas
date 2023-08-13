import { Box, ChakraProvider, theme } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { HashRouter } from "react-router-dom";
import { GlobalStateProvider, useGlobalState } from "./GlobalState";
import MyRoutes from "./MyRoutes";
import {
  AptosWalletAdapterProvider,
  NetworkName,
  Wallet,
} from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import {
  IdentityConnectWallet,
  IdentityConnectWalletConfig,
} from "@identity-connect/wallet-adapter-plugin";
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";

// It is okay for this to be publicly accessible.
const identityConnectDappId = "16c1632d-6b59-47d0-a7e3-3b00c216425f";

const queryClient = new QueryClient();

export const App = () => (
  <ChakraProvider theme={theme}>
    <GlobalStateProvider>
      <AppInner />
    </GlobalStateProvider>
  </ChakraProvider>
);

export const AppInner = () => {
  const [state] = useGlobalState();

  let wallets: Wallet[] = [];

  // First try to add IdentityConnectWallet. This only works if we're on a production
  // network, it doesn't work for local development.
  const networkName = getNetworkName(state.network_name);
  if (networkName) {
    const identityConnectWalletConfig: IdentityConnectWalletConfig = {
      networkName: networkName,
    };
    wallets.push(
      new IdentityConnectWallet(
        identityConnectDappId,
        identityConnectWalletConfig,
      ),
    );
  }

  // Add the rest of the wallets. This order is intentional.
  wallets = wallets.concat([
    new PetraWallet(),
    new PontemWallet(),
    new MartianWallet(),
    new FewchaWallet(),
  ]);

  return (
    // This key is necessary to make the wallets used by the WalletSelector refresh
    // when the selected network changes.
    <Box key={state.network_name}>
      <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
        <QueryClientProvider client={queryClient}>
          <HashRouter>
            <MyRoutes />
          </HashRouter>
        </QueryClientProvider>
      </AptosWalletAdapterProvider>
    </Box>
  );
};

const getNetworkName = (networkName: string): NetworkName | undefined => {
  switch (networkName) {
    case "devnet":
      return NetworkName.Devnet;
    case "testnet":
      return NetworkName.Testnet;
    case "mainnet":
      return NetworkName.Mainnet;
    default:
      return undefined;
  }
};
