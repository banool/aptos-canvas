import * as Types from "./types";

export type GetPixelAttributionQueryVariables = Types.Exact<{
  canvasAddress?: Types.InputMaybe<Types.Scalars["String"]>;
  index?: Types.InputMaybe<Types.Scalars["Int"]>;
}>;

export type GetPixelAttributionQuery = {
  __typename?: "Query";
  pixelAttribution: {
    __typename?: "PixelAttributionConnection";
    nodes: Array<{
      __typename?: "PixelAttribution";
      artistAddress: string;
      drawnAtSecs: number;
    }>;
  };
};
