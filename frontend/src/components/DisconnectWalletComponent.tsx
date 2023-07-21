import { Button } from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export const DisconnectWalletComponent = () => {
  const { disconnect } = useWallet();

  const handleDisconnectWallet = () => {
    disconnect();
  };

  return (
    <Button
      onClick={() => {
        handleDisconnectWallet();
      }}
    >
      Disconnect Wallet
    </Button>
  );
};
