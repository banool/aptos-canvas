import { useQuery, UseQueryResult } from "react-query";
import { getPntBalance } from "../../api";
import { ResponseError } from "../../api/client";
import { useGlobalState } from "../../GlobalState";
import { REFETCH_INTERVAL_MS } from "../helpers";

export function useGetPntBalance(
  address: string,
  options: {
    enabled?: boolean;
    // If you want to refetch the query when some additional criteria changes,
    // pass those criteria here. The query will be refetched when the value of
    // the state value given as additionalQueryCriteria changes.
    additionalQueryCriteria?: any;
  } = {},
): UseQueryResult<number, ResponseError> {
  const [state, _setState] = useGlobalState();

  const result = useQuery<number, ResponseError>(
    ["accountResources", { address }, state.network_info.node_api_url],
    () =>
      getPntBalance(
        { address, pntMetadataAddress: state.network_info.pntMetadataAddress },
        state.network_info.node_api_url,
      ),
    {
      refetchOnWindowFocus: false,
      enabled: options.enabled,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  return result;
}
