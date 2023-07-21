import { UseQueryResult, useQuery } from "react-query";
import { useGlobalState } from "../../GlobalState";
import { getAnsAddress } from "..";
import { NetworkName } from "../../constants";

export type AnsAddressLookup = {
  name: string;
  address: string | undefined;
};

const fetchAddresses = async (
  names: string[],
  network_name: NetworkName,
): Promise<AnsAddressLookup[]> => {
  return await Promise.all(
    names.map(async (name: any) => {
      return {
        name,
        address: await getAnsAddress(name, network_name),
      };
    }),
  );
};

export function useGetAnsAddresses(
  namesFn: () => string[],
  options: {
    enabled?: boolean;
  } = {},
): UseQueryResult<AnsAddressLookup[]> {
  const [state, _setState] = useGlobalState();

  const names = namesFn();
  return useQuery(
    ["ansAddresses", { names }, state.network_value],
    async () => {
      return fetchAddresses(names, state.network_name);
    },
    { refetchOnWindowFocus: false, enabled: options.enabled },
  );
}
