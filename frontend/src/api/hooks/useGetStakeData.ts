import { UseQueryResult, useQuery } from "react-query";
import { StakeData, getStakeData } from "..";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { REFETCH_INTERVAL_MS } from "../helpers";

export function useGetStakeData(
  tontineAddress: string,
  options: {
    enabled?: boolean;
    // If you want to refetch the query when some additional criteria changes,
    // pass those criteria here. The query will be refetched when the value of
    // the state value given as additionalQueryCriteria changes.
    additionalQueryCriteria?: any;
  } = {},
): UseQueryResult<StakeData | undefined> {
  const [state, _setState] = useGlobalState();
  const moduleId = getModuleId(state);

  return useQuery(
    [
      "getStakeData",
      { tontineAddress },
      state.network_value,
      options.additionalQueryCriteria,
    ],
    () => getStakeData(tontineAddress, moduleId, state.network_value),
    {
      refetchOnWindowFocus: false,
      enabled: options.enabled,
      // Refetch every 5 seconds.
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );
}
