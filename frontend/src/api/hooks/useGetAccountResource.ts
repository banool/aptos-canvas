import { Types } from "aptos";
import { useQuery } from "react-query";
import { getAccountResource } from "..";
import { ResponseError } from "../client";
import { useGlobalState } from "../../GlobalState";
import { REFETCH_INTERVAL_MS } from "../helpers";

export type useGetAccountResourceResponse = {
  accountResource: Types.MoveResource | undefined;
  isLoading: boolean;
  error: ResponseError | null;
};

export function useGetAccountResource(
  address: string,
  resource: string,
  options: {
    enabled?: boolean;
    // If you want to refetch the query when some additional criteria changes,
    // pass those criteria here. The query will be refetched when the value of
    // the state value given as additionalQueryCriteria changes.
    additionalQueryCriteria?: any;
  } = {},
): useGetAccountResourceResponse {
  const [state, _setState] = useGlobalState();

  const accountResourcesResult = useQuery<Types.MoveResource, ResponseError>(
    [
      "accountResource",
      { address },
      state.network_value,
      options.additionalQueryCriteria,
    ],
    () =>
      getAccountResource(
        { address, resourceType: resource },
        state.network_value,
      ),
    {
      refetchOnWindowFocus: false,
      enabled: options.enabled,
      // Refetch every 5 seconds.
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  const { isLoading, error } = accountResourcesResult;

  const accountResource = accountResourcesResult.data;

  return { accountResource, isLoading, error };
}
