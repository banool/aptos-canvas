export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ChainId = {
  __typename?: "ChainId";
  chainId: Scalars["Int"];
};

export type ChainIdConnection = {
  __typename?: "ChainIdConnection";
  edges: Array<ChainIdEdge>;
  nodes: Array<ChainId>;
  pageInfo: PageInfo;
  paginationInfo: Maybe<PaginationInfo>;
};

export type ChainIdEdge = {
  __typename?: "ChainIdEdge";
  cursor: Scalars["String"];
  node: ChainId;
};

export type ChainIdFilterInput = {
  and: InputMaybe<Array<ChainIdFilterInput>>;
  chainId: InputMaybe<IntegerFilterInput>;
  or: InputMaybe<Array<ChainIdFilterInput>>;
};

export type ChainIdOrderInput = {
  chainId: InputMaybe<OrderByEnum>;
};

export type CursorInput = {
  cursor: InputMaybe<Scalars["String"]>;
  limit: Scalars["Int"];
};

export type IntegerFilterInput = {
  eq: InputMaybe<Scalars["Int"]>;
  gt: InputMaybe<Scalars["Int"]>;
  gte: InputMaybe<Scalars["Int"]>;
  is_in: InputMaybe<Array<Scalars["Int"]>>;
  is_not_in: InputMaybe<Array<Scalars["Int"]>>;
  is_not_null: InputMaybe<Scalars["Boolean"]>;
  is_null: InputMaybe<Scalars["Boolean"]>;
  lt: InputMaybe<Scalars["Int"]>;
  lte: InputMaybe<Scalars["Int"]>;
  ne: InputMaybe<Scalars["Int"]>;
};

export type LastProcessedVersion = {
  __typename?: "LastProcessedVersion";
  processorName: Scalars["String"];
  version: Scalars["Int"];
};

export type LastProcessedVersionConnection = {
  __typename?: "LastProcessedVersionConnection";
  edges: Array<LastProcessedVersionEdge>;
  nodes: Array<LastProcessedVersion>;
  pageInfo: PageInfo;
  paginationInfo: Maybe<PaginationInfo>;
};

export type LastProcessedVersionEdge = {
  __typename?: "LastProcessedVersionEdge";
  cursor: Scalars["String"];
  node: LastProcessedVersion;
};

export type LastProcessedVersionFilterInput = {
  and: InputMaybe<Array<LastProcessedVersionFilterInput>>;
  or: InputMaybe<Array<LastProcessedVersionFilterInput>>;
  processorName: InputMaybe<StringFilterInput>;
  version: InputMaybe<IntegerFilterInput>;
};

export type LastProcessedVersionOrderInput = {
  processorName: InputMaybe<OrderByEnum>;
  version: InputMaybe<OrderByEnum>;
};

export type OffsetInput = {
  limit: Scalars["Int"];
  offset: Scalars["Int"];
};

export enum OrderByEnum {
  ASC = "ASC",
  DESC = "DESC",
}

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor: Maybe<Scalars["String"]>;
  hasNextPage: Scalars["Boolean"];
  hasPreviousPage: Scalars["Boolean"];
  startCursor: Maybe<Scalars["String"]>;
};

export type PageInput = {
  limit: Scalars["Int"];
  page: Scalars["Int"];
};

export type PaginationInfo = {
  __typename?: "PaginationInfo";
  current: Scalars["Int"];
  offset: Scalars["Int"];
  pages: Scalars["Int"];
  total: Scalars["Int"];
};

export type PaginationInput = {
  cursor: InputMaybe<CursorInput>;
  offset: InputMaybe<OffsetInput>;
  page: InputMaybe<PageInput>;
};

export type PixelAttribution = {
  __typename?: "PixelAttribution";
  artistAddress: Scalars["String"];
  canvasAddress: Scalars["String"];
  drawnAtSecs: Scalars["Int"];
  index: Scalars["Int"];
};

export type PixelAttributionConnection = {
  __typename?: "PixelAttributionConnection";
  edges: Array<PixelAttributionEdge>;
  nodes: Array<PixelAttribution>;
  pageInfo: PageInfo;
  paginationInfo: Maybe<PaginationInfo>;
};

export type PixelAttributionEdge = {
  __typename?: "PixelAttributionEdge";
  cursor: Scalars["String"];
  node: PixelAttribution;
};

export type PixelAttributionFilterInput = {
  and: InputMaybe<Array<PixelAttributionFilterInput>>;
  artistAddress: InputMaybe<StringFilterInput>;
  canvasAddress: InputMaybe<StringFilterInput>;
  drawnAtSecs: InputMaybe<IntegerFilterInput>;
  index: InputMaybe<IntegerFilterInput>;
  or: InputMaybe<Array<PixelAttributionFilterInput>>;
};

export type PixelAttributionOrderInput = {
  artistAddress: InputMaybe<OrderByEnum>;
  canvasAddress: InputMaybe<OrderByEnum>;
  drawnAtSecs: InputMaybe<OrderByEnum>;
  index: InputMaybe<OrderByEnum>;
};

export type Query = {
  __typename?: "Query";
  chainId: ChainIdConnection;
  lastProcessedVersion: LastProcessedVersionConnection;
  pixelAttribution: PixelAttributionConnection;
};

export type QuerychainIdArgs = {
  filters: InputMaybe<ChainIdFilterInput>;
  orderBy: InputMaybe<ChainIdOrderInput>;
  pagination: InputMaybe<PaginationInput>;
};

export type QuerylastProcessedVersionArgs = {
  filters: InputMaybe<LastProcessedVersionFilterInput>;
  orderBy: InputMaybe<LastProcessedVersionOrderInput>;
  pagination: InputMaybe<PaginationInput>;
};

export type QuerypixelAttributionArgs = {
  filters: InputMaybe<PixelAttributionFilterInput>;
  orderBy: InputMaybe<PixelAttributionOrderInput>;
  pagination: InputMaybe<PaginationInput>;
};

export type StringFilterInput = {
  contains: InputMaybe<Scalars["String"]>;
  ends_with: InputMaybe<Scalars["String"]>;
  eq: InputMaybe<Scalars["String"]>;
  gt: InputMaybe<Scalars["String"]>;
  gte: InputMaybe<Scalars["String"]>;
  is_in: InputMaybe<Array<Scalars["String"]>>;
  is_not_in: InputMaybe<Array<Scalars["String"]>>;
  is_not_null: InputMaybe<Scalars["Boolean"]>;
  is_null: InputMaybe<Scalars["Boolean"]>;
  like: InputMaybe<Scalars["String"]>;
  lt: InputMaybe<Scalars["String"]>;
  lte: InputMaybe<Scalars["String"]>;
  ne: InputMaybe<Scalars["String"]>;
  not_like: InputMaybe<Scalars["String"]>;
  starts_with: InputMaybe<Scalars["String"]>;
};
