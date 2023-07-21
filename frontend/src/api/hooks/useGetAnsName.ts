import { UseQueryResult, useQuery } from "react-query";
import { useGlobalState } from "../../GlobalState";
import { getAnsName } from "..";
import { NetworkName } from "../../constants";

export type AnsNameLookup = {
  address: string;
  name: string | undefined;
};

const fetchNames = async (
  addresses: string[],
  network_name: NetworkName,
): Promise<AnsNameLookup[]> => {
  return await Promise.all(
    addresses.map(async (address: any) => {
      return {
        address,
        name: await getAnsName(address, network_name),
      };
    }),
  );
};

export function useGetAnsNames(
  addresses: string[],
  options: {
    enabled?: boolean;
  } = {},
): UseQueryResult<AnsNameLookup[]> {
  const [state, _setState] = useGlobalState();

  return useQuery(
    ["ansNames", { addresses }, state.network_value],
    async () => {
      return fetchNames(addresses, state.network_name);
    },
    { refetchOnWindowFocus: false, enabled: options.enabled },
  );
}
