import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { getFeaturedCanvas, useGlobalState } from "../../GlobalState";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MyCanvas } from "../../components/MyCanvas";
import { MyCanvasLoader } from "../ViewPage/MyCanvasLoader";
import { isValidAccountAddress } from "../../utils";
import { FiEye } from "react-icons/fi";
import { HoverComponent } from "../../components/HoverComponent";

export const HomePage = () => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();
  const featuredCanvas = getFeaturedCanvas(state);
  const [navigateTo, setNavigateTo] = useState("");

  const addressIsValid = isValidAccountAddress(navigateTo);

  const viewButton = (
    <Button colorScheme="teal" isDisabled={!addressIsValid}>
      View
    </Button>
  );

  // Note: If there are more tontines than fit in a single screen, they overflow
  // beyond the end of the sidebar box downward. I have not been able to fix it yet.
  return (
    <Box p={5} flex="1">
      <Flex direction="column" align="center" justifyContent="center">
        <HStack spacing={4} w="80%">
          <Input
            w="100%"
            placeholder="Canvas address"
            value={navigateTo}
            onChange={(e) => setNavigateTo(e.target.value)}
          />
          {addressIsValid ? (
            <Link to={`/view/${navigateTo}`}>{viewButton}</Link>
          ) : (
            viewButton
          )}
        </HStack>
        <Box p={3} />
        <Link to={`/create`}>
          <Button colorScheme="teal">Create</Button>
        </Link>
        {featuredCanvas && (
          <>
            <Divider m={5} w={500} />
            <Heading padding={3} size="md">
              Featured Canvas
            </Heading>
            <HoverComponent link={`/view/${featuredCanvas}`}>
              <MyCanvasLoader
                writeable={false}
                canvasVh={60}
                address={featuredCanvas}
              />
            </HoverComponent>
          </>
        )}
      </Flex>
    </Box>
  );
};
