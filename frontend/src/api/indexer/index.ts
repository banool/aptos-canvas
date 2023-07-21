import { request, gql } from "graphql-request";

const operatorAddressOfStakingPool = gql`
  query ($delegationPool: String) {
    delegated_staking_pools(
      where: {
        current_staking_pool: { staking_pool_address: { _eq: $delegationPool } }
      }
    ) {
      current_staking_pool {
        staking_pool_address
        operator_address
      }
    }
  }
`;

// userAccountAddress must be a 0x account address.
export async function fetchOperatorAddressOfStakingPool(
  indexerUrl: string,
  delegationPool: string,
) {
  const variables = { delegationPool };
  return await request({
    url: indexerUrl,
    document: operatorAddressOfStakingPool,
    variables,
  });
}
