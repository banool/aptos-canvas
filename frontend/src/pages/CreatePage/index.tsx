import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Divider,
  Tr,
  Td,
  TableContainer,
  TableCaption,
  Table,
  Thead,
  Tbody,
  Th,
  Switch,
  Button,
  useToast,
  Center,
  Spinner,
} from "@chakra-ui/react";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { NetworkMismatchPage } from "../../components/NetworkMismatchPage";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { create } from "../../api/transactions";

export const CreatePage = () => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();
  const moduleId = getModuleId(state);
  const { signAndSubmitTransaction, connected } = useWallet();

  const {
    register,
    getValues,
    formState: { isValid },
  } = useForm();

  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  // Don't show the main content if the wallet and site networks mismatch.
  if (
    network &&
    !network.name.toLowerCase().startsWith(state.network_name.toLowerCase())
  ) {
    return (
      <NetworkMismatchPage
        walletNetworkName={network.name.toLowerCase()}
        siteNetworkName={state.network_name}
      />
    );
  }

  const myForm = (
    <form>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="name">
          What is the name of your canvas?
        </FormLabel>
        <Input
          id="name"
          {...register("name", {
            required: "Must specify name",
            minLength: {
              value: 1,
              message: "Must be at least 1 character long",
            },
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="description">
          How would you describe your canvas?
        </FormLabel>
        <Input
          id="description"
          {...register("description", {
            required: "Must specify description",
            minLength: {
              value: 1,
              message: "Must be at least 1 character long",
            },
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="width">
          How wide is your canvas?
        </FormLabel>
        <Input
          id="width"
          defaultValue={80}
          {...register("width", {
            required: "Must specify width",
            valueAsNumber: true,
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="height">
          How tall is your canvas?
        </FormLabel>
        <Input
          id="height"
          defaultValue={45}
          {...register("height", {
            required: "Must specify height",
            valueAsNumber: true,
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="per_account_timeout_s">
          (Optional) How often can each account write a pixel? (seconds)
        </FormLabel>
        <Input
          id="per_account_timeout_s"
          {...register("per_account_timeout_s", {
            valueAsNumber: true,
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="can_draw_for_s">
          (Optional) How long will your canvas be open for submissions?
          (seconds)
        </FormLabel>
        <Input
          id="can_draw_for_s"
          {...register("can_draw_for_s", {
            valueAsNumber: true,
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="cost">
          (Optional) Should it cost anything to draw on your canvas? (APT)
        </FormLabel>
        <Input
          id="cost"
          {...register("cost", {
            valueAsNumber: true,
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel paddingTop={3} htmlFor="owner_is_super_admin">
          Should the owner have super admin privileges? Or will you let it run
          its course without moderation.
        </FormLabel>
        <Switch
          id="owner_is_super_admin"
          {...register("owner_is_super_admin", {})}
        />
      </FormControl>
    </form>
  );

  const nanToZero = (n: number | undefined | null) => {
    if (n === undefined || n === null) {
      return 0;
    }
    if (isNaN(n)) {
      return 0;
    }
    return n;
  };

  const handleOnClick = async () => {
    setSubmitting(true);

    const values = getValues();

    try {
      await create(
        signAndSubmitTransaction,
        moduleId,
        state.network_value,
        values.description,
        values.name,
        values.width,
        values.height,
        nanToZero(values.per_account_timeout_s),
        nanToZero(values.can_draw_for_s),
        nanToZero(values.cost),
        0,
        0,
        0,
        values.owner_is_super_admin,
      );
      toast({
        title: "Success!",
        description: "Successfully created a canvas!!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Failure",
        description: `Failed to create canvas: ${e}`,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!connected) {
    return (
      <Center p={3} height="100%" flex="1" overflow="auto">
        <Text>Please connect your wallet to continue.</Text>
      </Center>
    );
  }

  // Note: If there are more tontines than fit in a single screen, they overflow
  // beyond the end of the sidebar box downward. I have not been able to fix it yet.
  return (
    <Flex p={3} height="100%" flex="1" overflow="auto">
      <Box p={5}>
        {myForm}
        <Button
          marginTop={5}
          colorScheme="teal"
          isDisabled={!isValid}
          onClick={handleOnClick}
        >
          {submitting ? <Spinner /> : `Create`}
        </Button>
      </Box>
    </Flex>
  );
};
