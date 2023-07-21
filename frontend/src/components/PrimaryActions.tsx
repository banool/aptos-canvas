import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Heading,
  Tooltip,
  Flex,
  Button,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  Spinner,
  useToast,
  Text,
  NumberInputField,
  Spacer,
} from "@chakra-ui/react";
import {
  aptToOcta,
  octaToAptNormal,
  simpleMapArrayToMap,
  validateAptString,
} from "../utils";
import { getModuleId, useGlobalState } from "../GlobalState";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  checkIn,
  claim,
  contribute,
  destroy,
  executeFallback,
  leave,
  lock,
  unlock,
  withdraw,
} from "../api/transactions";
import { useGetMemberStatuses } from "../api/hooks/useGetMemberStatuses";
import { useGetOverallStatus } from "../api/hooks/useGetOverallStatus";
import {
  MEMBER_STATUS_CAN_CLAIM_FUNDS,
  MEMBER_STATUS_STILL_ELIGIBLE,
  OVERALL_STATUS_CAN_BE_LOCKED,
  OVERALL_STATUS_FALLBACK_EXECUTED,
  OVERALL_STATUS_FUNDS_CLAIMABLE,
  OVERALL_STATUS_FUNDS_CLAIMED,
  OVERALL_STATUS_LOCKED,
  OVERALL_STATUS_STAGING,
} from "../constants";
import { useQueryClient } from "react-query";
import { useGetAccountResources } from "../api/hooks/useGetAccountResources";
import { ActiveTontine } from "../pages/HomePage";
import { onTxnFailure, onTxnSuccess } from "../api/helpers";
import { useGetStakeData } from "../api/hooks/useGetStakeData";

export function PrimaryActions({
  activeTontine,
  setActiveTontine,
}: {
  activeTontine: ActiveTontine;
  setActiveTontine: (tontine: ActiveTontine | null) => void;
}) {
  const [state, _] = useGlobalState();
  const queryClient = useQueryClient();

  const {
    isOpen: contributeIsOpen,
    onOpen: contributeOnOpen,
    onClose: contributeOnClose,
  } = useDisclosure();

  const {
    isOpen: withdrawIsOpen,
    onOpen: withdrawOnOpen,
    onClose: withdrawOnClose,
  } = useDisclosure();

  const { account, signAndSubmitTransaction } = useWallet();
  const toast = useToast();

  const moduleId = getModuleId(state);

  const [amountAptFormField, setAmountAptFormField] = useState("");
  const [waitingForTransaction, setWaitingForTransaction] = useState(false);

  const { data } = useGetAccountResources(activeTontine.address, {
    additionalQueryCriteria: waitingForTransaction,
  });

  const tontineResource = data?.find(
    (resource) => resource.type === `${moduleId}::Tontine`,
  );

  const objectResource = data?.find(
    (resource) => resource.type === "0x1::object::ObjectCore",
  );

  const tontineData = tontineResource?.data as any;
  const objectData = objectResource?.data as any;

  const creatorAddress = objectData?.owner;

  // Whether the user of this UI is the creator of this tontine.
  const userIsCreator = creatorAddress === account?.address;

  const isLocked = tontineData?.locked_time_secs > 0;

  const { data: stakeData } = useGetStakeData(activeTontine.address, {
    enabled: isLocked,
  });

  const {
    isLoading: memberStatusesIsLoading,
    data: memberStatusesRaw,
    error: memberStatusesError,
  } = useGetMemberStatuses(activeTontine.address, {
    enabled: tontineResource !== undefined,
    additionalQueryCriteria: tontineResource,
  });

  const {
    isLoading: overallStatusIsLoading,
    data: overallStatusRaw,
    error: overallStatusError,
  } = useGetOverallStatus(activeTontine.address, {
    enabled: tontineResource !== undefined,
    additionalQueryCriteria: tontineResource,
  });

  const memberStatusesData = memberStatusesRaw?.data
    ? simpleMapArrayToMap(memberStatusesRaw.data)
    : undefined;
  const memberStatus: number | undefined = account
    ? memberStatusesData?.get(account!.address)
    : undefined;
  const overallStatus: number | undefined = overallStatusRaw;

  const contributionAmount =
    tontineData && account
      ? simpleMapArrayToMap(tontineData.member_data.data).get(account.address)
          ?.contributed_octa
      : 0;

  const remainingContribution = tontineData
    ? tontineData?.config.per_member_amount_octa - contributionAmount
    : 0;

  const handleContribute = async () => {
    setWaitingForTransaction(true);
    const amountOcta = aptToOcta(parseFloat(amountAptFormField));

    try {
      // TODO: Make this configurable.
      await contribute(
        signAndSubmitTransaction,
        moduleId,
        state.network_value,
        activeTontine.address,
        amountOcta,
      );
      // If we get here, the transaction was committed successfully on chain.
      await onTxnSuccess({
        toast,
        queryClient,
        activeTontine,
        title: "Contributed funds to tontine",
        description: `Successfully contributed ${amountAptFormField} APT (${amountOcta}) OCTA)`,
      });
    } catch (e) {
      onTxnFailure({
        toast,
        title: "Failed to contribute to tontine",
        description: "Error: " + e,
      });
    } finally {
      setAmountAptFormField("");
      contributeOnClose();
      setWaitingForTransaction(false);
    }
  };

  const handleWithdraw = async () => {
    setWaitingForTransaction(true);
    const amountOcta = aptToOcta(parseFloat(amountAptFormField));

    try {
      // TODO: Make this configurable.
      await withdraw(
        signAndSubmitTransaction,
        moduleId,
        state.network_value,
        activeTontine.address,
        amountOcta,
      );
      // If we get here, the transaction was committed successfully on chain.
      await onTxnSuccess({
        toast,
        queryClient,
        activeTontine,
        title: "Withdrew funds from tontine",
        description: `Successfully withdrew ${amountAptFormField} APT (${amountOcta}) OCTA)`,
      });
    } catch (e) {
      onTxnFailure({
        toast,
        title: "Failed to withdraw from tontine",
        description: "Error: " + e,
      });
    } finally {
      setAmountAptFormField("");
      withdrawOnClose();
      setWaitingForTransaction(false);
    }
  };

  var baseDisabled =
    tontineData === undefined ||
    overallStatus === undefined ||
    memberStatus === undefined;
  var baseTooltip = baseDisabled ? "Loading..." : null;

  var contributeDisabled = baseDisabled;
  var contributeTooltip = baseTooltip;
  if (isLocked) {
    contributeDisabled = true;
    contributeTooltip = "Tontine is locked.";
  }

  var withdrawDisabled = baseDisabled;
  var withdrawTooltip = baseTooltip;
  if (isLocked) {
    withdrawDisabled = true;
    withdrawTooltip = "Tontine is locked.";
  } else if (contributionAmount === 0) {
    withdrawDisabled = true;
    withdrawTooltip = "You have not contributed anything yet.";
  }

  // This is only shown if the user is not the creator of the tontine.
  var leaveDisabled = baseDisabled;
  var leaveTooltip = baseTooltip;
  if (isLocked) {
    leaveDisabled = true;
    leaveTooltip = "Tontine is locked.";
  } else if (memberStatus === undefined) {
    leaveDisabled = true;
    leaveTooltip = "You are not a member of this tontine.";
  } else if (userIsCreator) {
    leaveDisabled = false;
    leaveTooltip =
      "Destroying the tontine will return any funds members have contributed.";
  }

  // This is only shown if the user is the creator of the tontine.
  var destroyDisabled = baseDisabled;
  var destroyTooltip = baseTooltip;
  if (memberStatus === undefined) {
    destroyDisabled = true;
    destroyTooltip = "You are not a member of this tontine.";
  } else if (
    overallStatus === OVERALL_STATUS_STAGING ||
    overallStatus === OVERALL_STATUS_CAN_BE_LOCKED
  ) {
    destroyDisabled = false;
    destroyTooltip =
      "Destroying the tontine will return any funds members have contributed.";
  } else if (
    overallStatus === OVERALL_STATUS_FUNDS_CLAIMED ||
    overallStatus === OVERALL_STATUS_FALLBACK_EXECUTED
  ) {
    destroyDisabled = false;
    destroyTooltip =
      "You will get a gas refund for destroying this finished tontine.";
  } else if (isLocked) {
    destroyDisabled = true;
    destroyTooltip = "Tontine is locked.";
  }

  var lockDisabled = baseDisabled;
  var lockTooltip = baseTooltip;
  if (overallStatus === OVERALL_STATUS_STAGING) {
    lockDisabled = true;
    lockTooltip =
      "Some members must still contribute before you can lock the tontine.";
  } else if (isLocked) {
    lockDisabled = true;
    lockTooltip = "Tontine is already locked.";
  }

  var checkInDisabled = baseDisabled;
  var checkInTooltip = baseTooltip;
  if (
    overallStatus === OVERALL_STATUS_STAGING ||
    overallStatus === OVERALL_STATUS_CAN_BE_LOCKED
  ) {
    checkInDisabled = true;
    checkInTooltip = "Tontine is not active yet, you must lock it.";
  } else if (memberStatus !== MEMBER_STATUS_CAN_CLAIM_FUNDS) {
    checkInDisabled = true;
    checkInTooltip = "You can claim the funds so can't check in anymore.";
  } else if (memberStatus !== MEMBER_STATUS_STILL_ELIGIBLE) {
    checkInDisabled = true;
    checkInTooltip = "You are no longer eligible to check in.";
  }

  var claimDisabled = baseDisabled;
  var claimTooltip = baseTooltip;
  if (
    overallStatus === OVERALL_STATUS_STAGING ||
    overallStatus === OVERALL_STATUS_CAN_BE_LOCKED
  ) {
    claimDisabled = true;
    claimTooltip = "Tontine is not active yet.";
  } else if (memberStatus !== MEMBER_STATUS_CAN_CLAIM_FUNDS) {
    claimDisabled = true;
    claimTooltip = "Multiple members are still eligible for the funds";
  } else if (!!stakeData?.pendingInactive) {
    const withdrawableAtString = new Date(
      stakeData.lockedUntil * 1000,
    ).toLocaleString();
    claimDisabled = true;
    claimTooltip = `Funds have been unstaked but they're not withdrawable yet. They will become withdrawable at ${withdrawableAtString}.`;
  }

  var unlockDisabled = baseDisabled;
  var unlockTooltip = baseTooltip;
  if (stakeData?.active) {
    unlockDisabled = false;
    unlockTooltip =
      "You are eligible to claim the funds, but they must be unstaked first";
  }

  var executeFallbackDisabled = baseDisabled;
  var executeFallbackTooltip = baseTooltip;
  if (
    overallStatus === OVERALL_STATUS_STAGING ||
    overallStatus === OVERALL_STATUS_CAN_BE_LOCKED
  ) {
    executeFallbackDisabled = true;
    executeFallbackTooltip = "Tontine is not active yet.";
  } else if (overallStatus === OVERALL_STATUS_LOCKED) {
    executeFallbackDisabled = true;
    executeFallbackTooltip = "Tontine is still active";
  } else if (overallStatus === OVERALL_STATUS_FUNDS_CLAIMABLE) {
    executeFallbackDisabled = true;
    executeFallbackTooltip = "Funds can still be claimed";
  } else if (overallStatus === OVERALL_STATUS_FUNDS_CLAIMED) {
    executeFallbackDisabled = true;
    executeFallbackTooltip = "Funds have already been claimed";
  } else if (overallStatus === OVERALL_STATUS_FALLBACK_EXECUTED) {
    executeFallbackDisabled = true;
    executeFallbackTooltip = "Fallback has already been executed";
  }

  if (
    overallStatus === OVERALL_STATUS_FUNDS_CLAIMED ||
    overallStatus === OVERALL_STATUS_FALLBACK_EXECUTED
  ) {
    const message = "The tontine is finished.";
    contributeDisabled = true;
    contributeTooltip = message;
    withdrawDisabled = true;
    withdrawTooltip = message;
    leaveDisabled = true;
    leaveTooltip = message;
    lockDisabled = true;
    lockTooltip = message;
    checkInDisabled = true;
    checkInTooltip = message;
    claimDisabled = true;
    claimTooltip = message;
    unlockDisabled = true;
    unlockTooltip = message;
    executeFallbackDisabled = true;
    executeFallbackTooltip = message;
  }

  if (account === null) {
    const message = "You must connect your wallet.";
    contributeDisabled = true;
    contributeTooltip = message;
    withdrawDisabled = true;
    withdrawTooltip = message;
    destroyDisabled = true;
    destroyTooltip = message;
    leaveDisabled = true;
    leaveTooltip = message;
    lockDisabled = true;
    lockTooltip = message;
    checkInDisabled = true;
    checkInTooltip = message;
    claimDisabled = true;
    claimTooltip = message;
    unlockDisabled = true;
    unlockTooltip = message;
    executeFallbackDisabled = true;
    executeFallbackTooltip = message;
  }

  var amountAptFormFieldOctaString = "0 OCTA";
  var inputAmountValid = false;
  const inputAsApt = validateAptString(amountAptFormField);
  if (inputAsApt !== null) {
    amountAptFormFieldOctaString = `${inputAsApt.toFixed(0)} OCTA`;
    inputAmountValid = true;
  }

  // TODO: If you're the creator of the tontine, you should be able to add / remove
  // people too.

  const contributeModal = (
    <Modal isOpen={contributeIsOpen} onClose={contributeOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Contribute</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl paddingBottom={5} isRequired>
            <FormLabel>Contribution amount (APT)</FormLabel>
            <NumberInput value={amountAptFormField}>
              <NumberInputField
                onChange={(e) => {
                  setAmountAptFormField(e.target.value);
                }}
              />
            </NumberInput>
            <Text paddingTop={2}>{amountAptFormFieldOctaString}</Text>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Tooltip
            label={
              remainingContribution > 0
                ? "Contribute the required remaining amount."
                : "You have already contributed the required amount"
            }
          >
            <Button
              isDisabled={remainingContribution <= 0}
              onClick={() =>
                setAmountAptFormField(
                  `${octaToAptNormal(remainingContribution)}`,
                )
              }
            >
              Remaining
            </Button>
          </Tooltip>
          <Spacer />
          <Button
            colorScheme="blue"
            isDisabled={!inputAmountValid}
            onClick={() => handleContribute()}
            mr={3}
          >
            {waitingForTransaction ? <Spinner /> : "Contribute"}
          </Button>
          <Button
            onClick={() => {
              setAmountAptFormField("");
              contributeOnClose();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const claimButton = (
    <Tooltip label={claimTooltip}>
      <Button
        colorScheme="blue"
        isDisabled={claimDisabled}
        onClick={async () => {
          setWaitingForTransaction(true);
          try {
            await claim(
              signAndSubmitTransaction,
              moduleId,
              state.network_value,
              activeTontine.address,
            );
            await onTxnSuccess({
              toast,
              queryClient,
              activeTontine,
              title: "Claimed funds",
              description:
                "You have successfully claimed the funds of the tontine.",
            });
          } catch (e) {
            onTxnFailure({
              toast,
              title: "Failed to claim funds",
              description: `Failed to claim the funds of the tontine: ${e}`,
            });
          } finally {
            setWaitingForTransaction(false);
          }
        }}
      >
        Claim
      </Button>
    </Tooltip>
  );

  const unlockButton = (
    <Tooltip label={unlockTooltip}>
      <Button
        colorScheme="blue"
        isDisabled={unlockDisabled}
        onClick={async () => {
          setWaitingForTransaction(true);
          try {
            await unlock(
              signAndSubmitTransaction,
              moduleId,
              state.network_value,
              activeTontine.address,
            );
            await onTxnSuccess({
              toast,
              queryClient,
              activeTontine,
              title: "Unlocked funds",
              description: "You have successfully unlocked the staked funds.",
            });
          } catch (e) {
            onTxnFailure({
              toast,
              title: "Failed to unlock funds",
              description: `Failed to unlock the staked funds: ${e}`,
            });
          } finally {
            setWaitingForTransaction(false);
          }
        }}
      >
        Unstake
      </Button>
    </Tooltip>
  );

  const withdrawModal = (
    <Modal isOpen={withdrawIsOpen} onClose={withdrawOnClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Withdraw</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl paddingBottom={5} isRequired>
            <FormLabel>Withdrawal amount (APT)</FormLabel>
            <NumberInput min={1} value={amountAptFormField}>
              <NumberInputField
                onChange={(e) => {
                  setAmountAptFormField(e.target.value);
                }}
              />
            </NumberInput>
            <Text paddingTop={2}>{amountAptFormFieldOctaString}</Text>
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            onClick={() =>
              setAmountAptFormField(`${octaToAptNormal(contributionAmount)}`)
            }
          >
            Contributed
          </Button>
          <Spacer />
          <Button
            colorScheme="blue"
            isDisabled={!inputAmountValid}
            onClick={() => handleWithdraw()}
            mr={3}
          >
            {waitingForTransaction ? <Spinner /> : "Withdraw"}
          </Button>
          <Button
            onClick={() => {
              setAmountAptFormField("");
              withdrawOnClose();
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
          <Tooltip label={contributeTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={contributeDisabled}
              onClick={contributeOnOpen}
            >
              Contribute
            </Button>
          </Tooltip>
          <Tooltip label={withdrawTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={withdrawDisabled}
              onClick={withdrawOnOpen}
            >
              Withdraw
            </Button>
          </Tooltip>
          {!userIsCreator ? (
            <Tooltip label={leaveTooltip}>
              <Button
                colorScheme="blue"
                isDisabled={leaveDisabled}
                onClick={async () => {
                  setWaitingForTransaction(true);
                  try {
                    await leave(
                      signAndSubmitTransaction,
                      moduleId,
                      state.network_value,
                      activeTontine.address,
                    );
                    await onTxnSuccess({
                      toast,
                      queryClient,
                      activeTontine,
                      title: "Left the tontine",
                      description: "You have successfully left the tontine.",
                    });
                  } catch (e) {
                    onTxnFailure({
                      toast,
                      title: "Failed to leave the tontine",
                      description: `Failed to leave the tontine: ${e}`,
                    });
                  } finally {
                    setWaitingForTransaction(false);
                  }
                }}
              >
                Leave
              </Button>
            </Tooltip>
          ) : (
            <Tooltip label={destroyTooltip}>
              <Button
                colorScheme="blue"
                isDisabled={destroyDisabled}
                onClick={async () => {
                  setWaitingForTransaction(true);
                  try {
                    await destroy(
                      signAndSubmitTransaction,
                      moduleId,
                      state.network_value,
                      activeTontine.address,
                    );
                    await onTxnSuccess({
                      toast,
                      queryClient,
                      activeTontine,
                      title: "Destroyed the tontine",
                      description:
                        "You have successfully destroyed the tontine.",
                    });
                  } catch (e) {
                    onTxnFailure({
                      toast,
                      title: "Failed to destroy the tontine",
                      description: `Failed to destroy the tontine: ${e}`,
                    });
                  } finally {
                    setWaitingForTransaction(false);
                    setActiveTontine(null);
                  }
                }}
              >
                Destroy
              </Button>
            </Tooltip>
          )}
          <Tooltip label={lockTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={lockDisabled}
              onClick={async () => {
                setWaitingForTransaction(true);
                try {
                  await lock(
                    signAndSubmitTransaction,
                    moduleId,
                    state.network_value,
                    activeTontine.address,
                  );
                  await onTxnSuccess({
                    toast,
                    queryClient,
                    activeTontine,
                    title: "Locked the tontine",
                    description: "You have successfully locked the tontine.",
                  });
                } catch (e) {
                  onTxnFailure({
                    toast,
                    title: "Failed to lock the tontine",
                    description: `Failed to lock the tontine: ${e}`,
                  });
                } finally {
                  setWaitingForTransaction(false);
                }
              }}
            >
              Lock
            </Button>
          </Tooltip>
          <Tooltip label={checkInTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={checkInDisabled}
              onClick={async () => {
                setWaitingForTransaction(true);
                try {
                  await checkIn(
                    signAndSubmitTransaction,
                    moduleId,
                    state.network_value,
                    activeTontine.address,
                  );
                  await onTxnSuccess({
                    toast,
                    queryClient,
                    activeTontine,

                    title: "Checked in",
                    description: "You have successfully checked in.",
                  });
                } catch (e) {
                  onTxnFailure({
                    toast,
                    title: "Failed to check in",
                    description: `Failed to check in: ${e}`,
                  });
                } finally {
                  setWaitingForTransaction(false);
                }
              }}
            >
              Check in
            </Button>
          </Tooltip>
          {stakeData && stakeData.active > 0 ? unlockButton : claimButton}
          <Tooltip label={executeFallbackTooltip}>
            <Button
              colorScheme="blue"
              isDisabled={executeFallbackDisabled}
              onClick={async () => {
                setWaitingForTransaction(true);
                try {
                  await executeFallback(
                    signAndSubmitTransaction,
                    moduleId,
                    state.network_value,
                    activeTontine.address,
                  );
                  await onTxnSuccess({
                    toast,
                    queryClient,
                    activeTontine,
                    title: "Executed fallback",
                    description:
                      "Successfully executed the fallback of the tontine.",
                  });
                } catch (e) {
                  onTxnFailure({
                    toast,
                    title: "Failed to execute fallback",
                    description: `Failed to execute the fallback of the tontine: ${e}`,
                  });
                } finally {
                  setWaitingForTransaction(false);
                }
              }}
            >
              Execute Fallback
            </Button>
          </Tooltip>
        </Flex>
      </Box>
      {contributeModal}
      {withdrawModal}
    </Box>
  );
}
