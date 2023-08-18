import { useQuery, UseQueryResult } from "react-query";
import { getPixelAttribution, PixelAttributionInner } from "../../api";
import { ResponseError } from "../../api/client";
import { getGqlUrl, useGlobalState } from "../../GlobalState";
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
  const gqlUrl = getGqlUrl(state);

  const result = useQuery<PixelAttributionInner | null, ResponseError>(
    ["pixelAttribution", { canvasAddress, index }, gqlUrl],
    () => getPixelAttribution(canvasAddress, index, gqlUrl),
    {
      refetchOnWindowFocus: false,
      enabled: options.enabled,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  return result;
}
