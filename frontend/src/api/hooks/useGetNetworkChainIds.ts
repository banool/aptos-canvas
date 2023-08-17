import { NetworkName, networkInfo } from "../../constants";
import { useQuery } from "react-query";
import { getLedgerInfoWithoutResponseError } from "..";
import {
  getLocalStorageWithExpiry,
  setLocalStorageWithExpiry,
} from "../../utils";

const TTL = 3600000; // 1 hour

export function useGetChainId(networkName: NetworkName): string | null {
  let chainIdFromCache = getLocalStorageWithExpiry(`${networkName}ChainId`);

  const { data } = useQuery(
    ["ledgerInfo", networkInfo[networkName]],
    () => {
      try {
        return getLedgerInfoWithoutResponseError(
          networkInfo[networkName].node_api_url,
        );
      } catch (e) {
        console.log(`Error fetching chainId for ${networkName}: ${e}`);
        return null;
      }
    },
    { enabled: chainIdFromCache === null },
  );

  if (chainIdFromCache !== null) {
    return chainIdFromCache;
  }

  const chainId = data?.chain_id ? data?.chain_id.toString() : null;

  // cache network chain ids (except local) to `localStorage` to avoid refetching chain data
  // as the chain ids for those networks won't be changed very often
  if (chainId !== null && networkName !== "local") {
    setLocalStorageWithExpiry(`${networkName}ChainId`, chainId, TTL);
  }

  return chainId;
}
