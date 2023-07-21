import { Button, useToast } from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const ConnectWalletComponent = () => {
  const { connect, wallets } = useWallet();

  const toast = useToast();

  // Only Petra right now.
  const handleConnectWallet = () => {
    let wallet = wallets.find((w) => w.name === "Petra");
    if (!wallet) {
      console.log("No Petra wallet found");
      toast({
        title: "Couldn't find Petra!",
        description: "Only Petra is supported right now.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log(`Connecting to ${wallet.name}...`);
    // TODO: This doesn't actually throw an exception if connect fails, figure out
    // how to handle the error properly.
    try {
      connect(wallet.name);
    } catch (e) {
      toast({
        title: "Failed to connect wallet",
        description: `${e}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Wallet icon component.
  return (
    <Button
      onClick={() => {
        handleConnectWallet();
      }}
    >
      Connect Wallet
    </Button>
  );
};
