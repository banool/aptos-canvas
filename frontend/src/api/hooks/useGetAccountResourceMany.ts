import { Types } from "aptos";
import { useQueries, UseQueryResult } from "react-query";
import { getAccountResource } from "..";
import { useGlobalState } from "../../GlobalState";

// Get the same resource on many different accounts.
export function useGetAccountResourceMany(
  addresses: string[],
  resource: string,
): UseQueryResult<Types.MoveResource>[] {
  const [state, _setState] = useGlobalState();

  const accountResourcesResults = useQueries(
    addresses.map((address) => {
      return {
        queryKey: ["address", address],
        queryFn: () =>
          getAccountResource(
            { address, resourceType: resource },
            state.network_value,
          ),
      };
    }),
  );

  return accountResourcesResults;
}
