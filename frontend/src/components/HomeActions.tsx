import {
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Tooltip,
  Flex,
  Button,
  Spacer,
  Link,
  CloseButton,
  useDisclosure,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { isValidAccountAddress } from "../utils";
import { ActiveTontine } from "../pages/HomePage";

export function HomeActions({
  showingCreateComponent,
  setShowingCreateComponent,
  setActiveTontine,
}: {
  showingCreateComponent: boolean;
  setShowingCreateComponent: (b: boolean) => void;
  setActiveTontine: (tontine: ActiveTontine | null) => void;
}) {
  const { connected } = useWallet();

  var createDisabled = !connected || showingCreateComponent;
  var createTooltip = connected ? null : "You must connect your wallet.";

  const {
    isOpen: enterAddressModalIsOpen,
    onOpen: enterAddressModalOnOpen,
    onClose: enterAddressModalOnClose,
  } = useDisclosure();

  const [addressToOpen, setAddressToOpen] = useState("");

  var closeButtonComponent = (
    <>
      <Spacer />
      <Box paddingRight={5}>
        <CloseButton
          size="md"
          bg="red.500"
          onClick={() => setShowingCreateComponent(false)}
        />
      </Box>
    </>
  );

  // TOOD: Make this wider so the address fits nicely.
  // TODO: Make it so pressing enter works, like onSubmit.
  const enterAddressModal = (
    <Modal isOpen={enterAddressModalIsOpen} onClose={enterAddressModalOnClose}>
      <ModalOverlay />
      <ModalContent minW="725px">
        <ModalHeader>View Tontine</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl paddingBottom={5} isRequired>
            <FormLabel>Tontine address</FormLabel>
            <Input
              value={addressToOpen}
              onChange={(e) => setAddressToOpen(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            isDisabled={!isValidAccountAddress(addressToOpen)}
            onClick={() => {
              // Only tontine_address matters here.
              setActiveTontine({ address: addressToOpen });
              enterAddressModalOnClose();
            }}
            mr={3}
          >
            View
          </Button>
          <Button
            onClick={() => {
              setAddressToOpen("");
              enterAddressModalOnClose();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return (
    <Box display="flex" flexDirection="column">
      <Box p={7}>
        <Flex alignItems="center" gap="4">
          <Heading size="sm">Actions:</Heading>
          <Tooltip label={createTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={createDisabled}
              onClick={() => setShowingCreateComponent(true)}
            >
              Create a Tontine
            </Button>
          </Tooltip>
          <Tooltip label="Use this to view information about tontines of which you're not a member.">
            <Button
              colorScheme="blue"
              onClick={() => enterAddressModalOnOpen()}
            >
              View a Tontine
            </Button>
          </Tooltip>
          <Link href="https://github.com/banool/aptos-tontine" target="_blank">
            <Button colorScheme="blue">Learn More</Button>
          </Link>
          {showingCreateComponent ? closeButtonComponent : null}
        </Flex>
      </Box>
      {enterAddressModal}
    </Box>
  );
}
