import { CreateToastFnReturn } from "@chakra-ui/react";
import { ActiveTontine } from "../pages/HomePage";
import { QueryClient } from "react-query";

export const REFETCH_INTERVAL_MS = 8000;

export const onTxnSuccess = async ({
  toast,
  queryClient,
  activeTontine,
  title,
  description,
}: {
  toast: CreateToastFnReturn;
  queryClient: QueryClient;
  activeTontine: ActiveTontine;
  title: string;
  description: string;
}) => {
  // Indicate that the transaction was successful.
  toast({
    title,
    description,
    status: "success",
    duration: 4000,
    isClosable: true,
  });
  // Wait a short while before invalidating to make it more likely that we avoid
  // read inconsistency from the fullnodes / indexer lag.
  await new Promise((r) => setTimeout(r, 100));
  // Invalidate every query.
  // https://tanstack.com/query/v4/docs/react/guides/query-invalidation
  queryClient.invalidateQueries();
};

export const onTxnFailure = ({
  toast,
  title,
  description,
}: {
  toast: CreateToastFnReturn;
  title: string;
  description: string;
}) => {
  // Indicate that the transaction failed.
  toast({
    title,
    description,
    status: "error",
    duration: 6000,
    isClosable: true,
  });
};
