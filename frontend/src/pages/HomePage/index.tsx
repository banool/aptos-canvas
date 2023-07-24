import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useGlobalState } from "../../GlobalState";

export const HomePage = () => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();

  // Note: If there are more tontines than fit in a single screen, they overflow
  // beyond the end of the sidebar box downward. I have not been able to fix it yet.
  return (
    <Flex p={3} height="100%" flex="1" overflow="auto">
      <Text>Home page</Text>
    </Flex>
  );
};
