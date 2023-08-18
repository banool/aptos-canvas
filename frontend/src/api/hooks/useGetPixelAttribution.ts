import { useQuery, UseQueryResult } from "react-query";
import { getPixelAttribution, PixelAttributionInner } from "../../api";
import { ResponseError } from "../../api/client";
import { useGlobalState } from "../../GlobalState";
import { REFETCH_INTERVAL_MS } from "../helpers";

export function useGetPixelAttribution(
  canvasAddress: string,
  index: number,
  options: {
    enabled?: boolean;
    // If you want to refetch the query when some additional criteria changes,
    // pass those criteria here. The query will be refetched when the value of
    // the state value given as additionalQueryCriteria changes.
    additionalQueryCriteria?: any;
  } = {},
): UseQueryResult<PixelAttributionInner | null, ResponseError> {
  const [state, _setState] = useGlobalState();

  const result = useQuery<PixelAttributionInner | null, ResponseError>(
    [
      "pixelAttribution",
      { canvasAddress, index },
      state.network_info.indexer_url,
    ],
    () =>
      getPixelAttribution(
        canvasAddress,
        index,
        state.network_info.indexer_url!,
      ),
    {
      refetchOnWindowFocus: false,
      enabled: options.enabled,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  return result;
}
