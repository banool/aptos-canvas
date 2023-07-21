import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spinner,
  Button,
  useDisclosure,
  Box,
  Tooltip,
} from "@chakra-ui/react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useState } from "react";
import { inviteMember } from "../api/transactions";
import { getModuleId, useGlobalState } from "../GlobalState";
import { ActiveTontine } from "../pages/HomePage";
import { onTxnFailure, onTxnSuccess } from "../api/helpers";
import { useQueryClient } from "react-query";
import { useGetAnsAddresses } from "../api/hooks/useGetAnsAddress";
import { isValidAccountAddress } from "../utils";

export function InviteMemberButton({
  activeTontine,
}: {
  activeTontine: ActiveTontine;
}) {
  const [state, _] = useGlobalState();
  const { connected, signAndSubmitTransaction } = useWallet();
  const moduleId = getModuleId(state);
  const toast = useToast();
  const queryClient = useQueryClient();

  const [waitingForTransaction, setWaitingForTransaction] = useState(false);

  const {
    isOpen: enterAddressModalIsOpen,
    onOpen: enterAddressModalOnOpen,
    onClose: enterAddressModalOnClose,
  } = useDisclosure();

  const [addressToAdd, setAddressToAdd] = useState("");

  const { data: ansAddressLookups } = useGetAnsAddresses(() => [addressToAdd], {
    enabled: addressToAdd.length > 1,
  });

  const ansAddressLookup = ansAddressLookups?.find(
    (ans) => ans.address === addressToAdd,
  );

  const addressToSubmit = ansAddressLookup?.address ?? addressToAdd;

  const submitIsDisabled = !isValidAccountAddress(addressToSubmit);

  // TOOD: Make this wider so the address fits nicely.
  const addMemberModal = (
    <Modal isOpen={enterAddressModalIsOpen} onClose={enterAddressModalOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite Member</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl paddingBottom={5} isRequired>
            <FormLabel>
              {"Member to invite "}

              <sup>
                <Tooltip label="You may enter either an account address or ANS name.">
                  ⓘ
                </Tooltip>
              </sup>
            </FormLabel>
            <Input
              value={addressToAdd}
              onChange={(e) => setAddressToAdd(e.target.value)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            isDisabled={submitIsDisabled}
            onClick={async () => {
              setWaitingForTransaction(true);
              var addressString = addressToSubmit;
              if (ansAddressLookup?.address !== addressToSubmit) {
                addressString += ` (${ansAddressLookup?.name})`;
              }
              try {
                await inviteMember(
                  signAndSubmitTransaction,
                  moduleId,
                  state.network_value,
                  activeTontine.address,
                  addressToSubmit,
                );
                await onTxnSuccess({
                  toast,
                  queryClient,
                  activeTontine,
                  title: "Added member",
                  description: `Successfully added ${addressString} to the tontine.`,
                });
              } catch (e) {
                onTxnFailure({
                  toast,
                  title: "Failed to add member",
                  description: `Failed to add member: ${e}`,
                });
              } finally {
                setWaitingForTransaction(false);
                enterAddressModalOnClose();
              }
            }}
            mr={3}
          >
            {waitingForTransaction ? <Spinner /> : "Invite member"}
          </Button>
          <Button
            onClick={() => {
              setAddressToAdd("");
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
    <Box>
      <Button colorScheme="blue" onClick={enterAddressModalOnOpen}>
        Invite member
      </Button>
      {addMemberModal}
    </Box>
  );
}
