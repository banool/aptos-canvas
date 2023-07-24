import { Box, Center, Text } from "@chakra-ui/react";

export const NetworkMismatchPage = ({
  walletNetworkName,
  siteNetworkName,
}: {
  walletNetworkName: string;
  siteNetworkName: string;
}) => {
  return (
      <Center p={3} height="100%" flex="1" overflow="auto">
      <Text>
        Your wallet network is {walletNetworkName} but you've selected{" "}
        {siteNetworkName} in the site, please make sure they match.
      </Text>
    </Center>
  );
};
