import { useQuery } from "react-query";
import { ResponseError } from "../client";
import { getIndexerUrl, useGlobalState } from "../../GlobalState";
import { fetchOperatorAddressOfStakingPool } from "../indexer";

export type useGetOperatorAddressOfStakingPoolResponse = {
  operatorAddress: string | undefined;
  isLoading: boolean;
  error: ResponseError | null;
};

export function useGetOperatorAddressOfStakingPool(
  delegationPoolAddress: string,
  options: {
    enabled?: boolean;
    // If you want to refetch the query when some additional criteria changes,
    // pass those criteria here. The query will be refetched when the value of
    // the state value given as additionalQueryCriteria changes.
    additionalQueryCriteria?: any;
  } = {},
): useGetOperatorAddressOfStakingPoolResponse {
  const [state, _setState] = useGlobalState();

  const result = useQuery<any, ResponseError>(
    [
      "getOperatorAddressOfStakingPool",
      { delegationPoolAddress },
      state.network_value,
      options.additionalQueryCriteria,
    ],
    async () =>
      await fetchOperatorAddressOfStakingPool(
        getIndexerUrl(state),
        delegationPoolAddress,
      ),
    { refetchOnWindowFocus: false, enabled: options.enabled },
  );

  const { isLoading, error } = result;

  var operatorAddress = undefined;
  if (result.data) {
    const delegated_staking_pools = (result.data as any)
      .delegated_staking_pools;
    if (delegated_staking_pools.length > 0) {
      operatorAddress =
        delegated_staking_pools[0].current_staking_pool.operator_address;
    }
  }

  return { operatorAddress, isLoading, error };
}
