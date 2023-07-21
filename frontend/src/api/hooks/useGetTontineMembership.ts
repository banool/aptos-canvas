import { UseQueryResult, useQuery } from "react-query";
import { useGlobalState } from "../../GlobalState";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { REFETCH_INTERVAL_MS } from "../helpers";

export const BASIC_TONTINE_STATE_STAGING = 0;
export const BASIC_TONTINE_STATE_LOCKED = 1;
export const BASIC_TONTINE_STATE_COMPLETE = -1;

export const TONTINE_MEMBERSHIP_QUERY_KEY = "tontineMembership";

export type TontineMembership = {
  tontine_address: string;
  is_creator: boolean;
  has_ever_contributed: boolean;
  state: number;
};

export function useGetTontineMembership(): UseQueryResult<TontineMembership[]> {
  const [state, _setState] = useGlobalState();
  const { account } = useWallet();

  return useQuery<TontineMembership[]>(
    [TONTINE_MEMBERSHIP_QUERY_KEY, { account }, state.network_value],
    async () => {
      const res = await fetch(
        `https://tontine-processor.dport.me/${state.network_name}/tontines/${
          account!.address
        }`,
      );
      const data = await res.json();
      return data;
    },
    {
      refetchOnWindowFocus: false,
      enabled: account !== null,
      // Refetch every 5 seconds.
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );
}
