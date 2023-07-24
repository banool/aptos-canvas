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
} from "@chakra-ui/react";
import { useGlobalState } from "../../GlobalState";
import { NetworkMismatchPage } from "../../components/NetworkMismatchPage";
import { useForm } from "react-hook-form";

export const CreatePage = () => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();

  const {
    register,
    getValues,
    formState: { isValid },
  } = useForm();

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
          defaultValue={400}
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
          defaultValue={300}
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

  // Note: If there are more tontines than fit in a single screen, they overflow
  // beyond the end of the sidebar box downward. I have not been able to fix it yet.
  return (
    <Flex p={3} height="100%" flex="1" overflow="auto">
      {myForm}
    </Flex>
  );
};
