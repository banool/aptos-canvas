import { Text, Icon, VStack } from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetPntBalance } from "../../api/hooks/useGetPntBalance";

const BUTTON_SIZE = 48;

// Don't try to use this without the wallet being connected.
export default function PaintInfo() {
  const { account } = useWallet();

  const { data } = useGetPntBalance(account?.address ?? "", {
    enabled: !!account,
  });

  // On chain, it costs 100 units to paint a pixel. PNT, the fungible asset, uses
  // two decimal places. As such, if the user has 1000 units on chain, we tell the
  // user that they have 10 PNT. We choose not to show them decimal places to
  // maintain the illusion that there is no such thing as fractional PNT.
  const pntAmount = Math.floor((data ?? 0) / 100);

  return (
    <VStack>
      <Icon as={CalendarIcon} />
      <Text>{pntAmount.toLocaleString()}</Text>
      <Text>PNT</Text>
    </VStack>
  );
}
