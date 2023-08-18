import * as Types from "./operations";

import { GraphQLClient } from "graphql-request";
import * as Dom from "graphql-request/dist/types.dom";

export const GetPixelAttribution = `
    query getPixelAttribution($canvasAddress: String, $index: Int) {
  pixelAttribution(
    filters: {canvasAddress: {eq: $canvasAddress}, index: {eq: $index}}
  ) {
    nodes {
      artistAddress
      drawnAtSecs
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper,
) {
  return {
    getPixelAttribution(
      variables?: Types.GetPixelAttributionQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"],
    ): Promise<Types.GetPixelAttributionQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<Types.GetPixelAttributionQuery>(
            GetPixelAttribution,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders },
          ),
        "getPixelAttribution",
        "query",
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
