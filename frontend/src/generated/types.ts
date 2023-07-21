export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Address: string;
  Any: any;
  U8: number;
  U16: number;
  U32: number;
  U64: string;
  U128: string;
  U256: string;
};

export type _0x1__account__Account = {
  __typename?: '_0x1__account__Account';
  authentication_key: Array<Scalars['U8']>;
  coin_register_events: _0x1__event__EventHandle;
  guid_creation_num: Scalars['U64'];
  key_rotation_events: _0x1__event__EventHandle;
  rotation_capability_offer: _0x1__account__CapabilityOffer;
  sequence_number: Scalars['U64'];
  signer_capability_offer: _0x1__account__CapabilityOffer;
};

export type _0x1__account__CapabilityOffer = {
  __typename?: '_0x1__account__CapabilityOffer';
  for: Maybe<Scalars['Address']>;
};

export type _0x1__account__CoinRegisterEvent = {
  __typename?: '_0x1__account__CoinRegisterEvent';
  type_info: _0x1__type_info__TypeInfo;
};

export type _0x1__account__KeyRotationEvent = {
  __typename?: '_0x1__account__KeyRotationEvent';
  new_authentication_key: Array<Scalars['U8']>;
  old_authentication_key: Array<Scalars['U8']>;
};

export type _0x1__account__OriginatingAddress = {
  __typename?: '_0x1__account__OriginatingAddress';
  address_map: _0x1__table__Table;
};

export type _0x1__account__RotationCapability = {
  __typename?: '_0x1__account__RotationCapability';
  account: Scalars['Address'];
};

export type _0x1__account__RotationCapabilityOfferProofChallenge = {
  __typename?: '_0x1__account__RotationCapabilityOfferProofChallenge';
  recipient_address: Scalars['Address'];
  sequence_number: Scalars['U64'];
};

export type _0x1__account__RotationCapabilityOfferProofChallengeV2 = {
  __typename?: '_0x1__account__RotationCapabilityOfferProofChallengeV2';
  chain_id: Scalars['U8'];
  recipient_address: Scalars['Address'];
  sequence_number: Scalars['U64'];
  source_address: Scalars['Address'];
};

export type _0x1__account__RotationProofChallenge = {
  __typename?: '_0x1__account__RotationProofChallenge';
  current_auth_key: Scalars['Address'];
  new_public_key: Array<Scalars['U8']>;
  originator: Scalars['Address'];
  sequence_number: Scalars['U64'];
};

export type _0x1__account__SignerCapability = {
  __typename?: '_0x1__account__SignerCapability';
  account: Scalars['Address'];
};

export type _0x1__account__SignerCapabilityOfferProofChallenge = {
  __typename?: '_0x1__account__SignerCapabilityOfferProofChallenge';
  recipient_address: Scalars['Address'];
  sequence_number: Scalars['U64'];
};

export type _0x1__account__SignerCapabilityOfferProofChallengeV2 = {
  __typename?: '_0x1__account__SignerCapabilityOfferProofChallengeV2';
  recipient_address: Scalars['Address'];
  sequence_number: Scalars['U64'];
  source_address: Scalars['Address'];
};

export type _0x1__acl__ACL = {
  __typename?: '_0x1__acl__ACL';
  list: Array<Scalars['Address']>;
};

export type _0x1__aggregator__Aggregator = {
  __typename?: '_0x1__aggregator__Aggregator';
  handle: Scalars['Address'];
  key: Scalars['Address'];
  limit: Scalars['U128'];
};

export type _0x1__aggregator_factory__AggregatorFactory = {
  __typename?: '_0x1__aggregator_factory__AggregatorFactory';
  phantom_table: _0x1__table__Table;
};

export type _0x1__any__Any = {
  __typename?: '_0x1__any__Any';
  data: Array<Scalars['U8']>;
  type_name: Scalars['String'];
};

export type _0x1__aptos_account__DirectCoinTransferConfigUpdatedEvent = {
  __typename?: '_0x1__aptos_account__DirectCoinTransferConfigUpdatedEvent';
  new_allow_direct_transfers: Scalars['Boolean'];
};

export type _0x1__aptos_account__DirectTransferConfig = {
  __typename?: '_0x1__aptos_account__DirectTransferConfig';
  allow_arbitrary_coin_transfers: Scalars['Boolean'];
  update_coin_transfer_events: _0x1__event__EventHandle;
};

export type _0x1__aptos_coin__AptosCoin = {
  __typename?: '_0x1__aptos_coin__AptosCoin';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__aptos_coin__DelegatedMintCapability = {
  __typename?: '_0x1__aptos_coin__DelegatedMintCapability';
  to: Scalars['Address'];
};

export type _0x1__aptos_coin__Delegations = {
  __typename?: '_0x1__aptos_coin__Delegations';
  inner: Array<_0x1__aptos_coin__DelegatedMintCapability>;
};

export type _0x1__aptos_coin__MintCapStore = {
  __typename?: '_0x1__aptos_coin__MintCapStore';
  mint_cap: _0x1__coin__MintCapability;
};

export type _0x1__aptos_governance__ApprovedExecutionHashes = {
  __typename?: '_0x1__aptos_governance__ApprovedExecutionHashes';
  hashes: _0x1__simple_map__SimpleMap;
};

export type _0x1__aptos_governance__CreateProposalEvent = {
  __typename?: '_0x1__aptos_governance__CreateProposalEvent';
  execution_hash: Array<Scalars['U8']>;
  proposal_id: Scalars['U64'];
  proposal_metadata: _0x1__simple_map__SimpleMap;
  proposer: Scalars['Address'];
  stake_pool: Scalars['Address'];
};

export type _0x1__aptos_governance__GovernanceConfig = {
  __typename?: '_0x1__aptos_governance__GovernanceConfig';
  min_voting_threshold: Scalars['U128'];
  required_proposer_stake: Scalars['U64'];
  voting_duration_secs: Scalars['U64'];
};

export type _0x1__aptos_governance__GovernanceEvents = {
  __typename?: '_0x1__aptos_governance__GovernanceEvents';
  create_proposal_events: _0x1__event__EventHandle;
  update_config_events: _0x1__event__EventHandle;
  vote_events: _0x1__event__EventHandle;
};

export type _0x1__aptos_governance__GovernanceResponsbility = {
  __typename?: '_0x1__aptos_governance__GovernanceResponsbility';
  signer_caps: _0x1__simple_map__SimpleMap;
};

export type _0x1__aptos_governance__RecordKey = {
  __typename?: '_0x1__aptos_governance__RecordKey';
  proposal_id: Scalars['U64'];
  stake_pool: Scalars['Address'];
};

export type _0x1__aptos_governance__UpdateConfigEvent = {
  __typename?: '_0x1__aptos_governance__UpdateConfigEvent';
  min_voting_threshold: Scalars['U128'];
  required_proposer_stake: Scalars['U64'];
  voting_duration_secs: Scalars['U64'];
};

export type _0x1__aptos_governance__VoteEvent = {
  __typename?: '_0x1__aptos_governance__VoteEvent';
  num_votes: Scalars['U64'];
  proposal_id: Scalars['U64'];
  should_pass: Scalars['Boolean'];
  stake_pool: Scalars['Address'];
  voter: Scalars['Address'];
};

export type _0x1__aptos_governance__VotingRecords = {
  __typename?: '_0x1__aptos_governance__VotingRecords';
  votes: _0x1__table__Table;
};

export type _0x1__big_vector__BigVector = {
  __typename?: '_0x1__big_vector__BigVector';
  bucket_size: Scalars['U64'];
  buckets: _0x1__table_with_length__TableWithLength;
  end_index: Scalars['U64'];
};

export type _0x1__bit_vector__BitVector = {
  __typename?: '_0x1__bit_vector__BitVector';
  bit_field: Array<Scalars['Boolean']>;
  length: Scalars['U64'];
};

export type _0x1__block__BlockResource = {
  __typename?: '_0x1__block__BlockResource';
  epoch_interval: Scalars['U64'];
  height: Scalars['U64'];
  new_block_events: _0x1__event__EventHandle;
  update_epoch_interval_events: _0x1__event__EventHandle;
};

export type _0x1__block__NewBlockEvent = {
  __typename?: '_0x1__block__NewBlockEvent';
  epoch: Scalars['U64'];
  failed_proposer_indices: Array<Scalars['U64']>;
  hash: Scalars['Address'];
  height: Scalars['U64'];
  previous_block_votes_bitvec: Array<Scalars['U8']>;
  proposer: Scalars['Address'];
  round: Scalars['U64'];
  time_microseconds: Scalars['U64'];
};

export type _0x1__block__UpdateEpochIntervalEvent = {
  __typename?: '_0x1__block__UpdateEpochIntervalEvent';
  new_epoch_interval: Scalars['U64'];
  old_epoch_interval: Scalars['U64'];
};

export type _0x1__bls12381__AggrOrMultiSignature = {
  __typename?: '_0x1__bls12381__AggrOrMultiSignature';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381__AggrPublicKeysWithPoP = {
  __typename?: '_0x1__bls12381__AggrPublicKeysWithPoP';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381__ProofOfPossession = {
  __typename?: '_0x1__bls12381__ProofOfPossession';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381__PublicKey = {
  __typename?: '_0x1__bls12381__PublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381__PublicKeyWithPoP = {
  __typename?: '_0x1__bls12381__PublicKeyWithPoP';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381__Signature = {
  __typename?: '_0x1__bls12381__Signature';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__bls12381_algebra__FormatFq12LscLsb = {
  __typename?: '_0x1__bls12381_algebra__FormatFq12LscLsb';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatFrLsb = {
  __typename?: '_0x1__bls12381_algebra__FormatFrLsb';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatFrMsb = {
  __typename?: '_0x1__bls12381_algebra__FormatFrMsb';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatG1Compr = {
  __typename?: '_0x1__bls12381_algebra__FormatG1Compr';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatG1Uncompr = {
  __typename?: '_0x1__bls12381_algebra__FormatG1Uncompr';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatG2Compr = {
  __typename?: '_0x1__bls12381_algebra__FormatG2Compr';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatG2Uncompr = {
  __typename?: '_0x1__bls12381_algebra__FormatG2Uncompr';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__FormatGt = {
  __typename?: '_0x1__bls12381_algebra__FormatGt';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__Fq12 = {
  __typename?: '_0x1__bls12381_algebra__Fq12';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__Fr = {
  __typename?: '_0x1__bls12381_algebra__Fr';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__G1 = {
  __typename?: '_0x1__bls12381_algebra__G1';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__G2 = {
  __typename?: '_0x1__bls12381_algebra__G2';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__Gt = {
  __typename?: '_0x1__bls12381_algebra__Gt';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__HashG1XmdSha256SswuRo = {
  __typename?: '_0x1__bls12381_algebra__HashG1XmdSha256SswuRo';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__bls12381_algebra__HashG2XmdSha256SswuRo = {
  __typename?: '_0x1__bls12381_algebra__HashG2XmdSha256SswuRo';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__capability__Cap = {
  __typename?: '_0x1__capability__Cap';
  root: Scalars['Address'];
};

export type _0x1__capability__CapDelegateState = {
  __typename?: '_0x1__capability__CapDelegateState';
  root: Scalars['Address'];
};

export type _0x1__capability__CapState = {
  __typename?: '_0x1__capability__CapState';
  delegates: Array<Scalars['Address']>;
};

export type _0x1__capability__LinearCap = {
  __typename?: '_0x1__capability__LinearCap';
  root: Scalars['Address'];
};

export type _0x1__chain_id__ChainId = {
  __typename?: '_0x1__chain_id__ChainId';
  id: Scalars['U8'];
};

export type _0x1__chain_status__GenesisEndMarker = {
  __typename?: '_0x1__chain_status__GenesisEndMarker';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__code__AllowedDep = {
  __typename?: '_0x1__code__AllowedDep';
  account: Scalars['Address'];
  module_name: Scalars['String'];
};

export type _0x1__code__ModuleMetadata = {
  __typename?: '_0x1__code__ModuleMetadata';
  extension: Maybe<_0x1__copyable_any__Any>;
  name: Scalars['String'];
  source: Array<Scalars['U8']>;
  source_map: Array<Scalars['U8']>;
};

export type _0x1__code__PackageDep = {
  __typename?: '_0x1__code__PackageDep';
  account: Scalars['Address'];
  package_name: Scalars['String'];
};

export type _0x1__code__PackageMetadata = {
  __typename?: '_0x1__code__PackageMetadata';
  deps: Array<_0x1__code__PackageDep>;
  extension: Maybe<_0x1__copyable_any__Any>;
  manifest: Array<Scalars['U8']>;
  modules: Array<_0x1__code__ModuleMetadata>;
  name: Scalars['String'];
  source_digest: Scalars['String'];
  upgrade_number: Scalars['U64'];
  upgrade_policy: _0x1__code__UpgradePolicy;
};

export type _0x1__code__PackageRegistry = {
  __typename?: '_0x1__code__PackageRegistry';
  packages: Array<_0x1__code__PackageMetadata>;
};

export type _0x1__code__UpgradePolicy = {
  __typename?: '_0x1__code__UpgradePolicy';
  policy: Scalars['U8'];
};

export type _0x1__coin__AggregatableCoin = {
  __typename?: '_0x1__coin__AggregatableCoin';
  value: _0x1__aggregator__Aggregator;
};

export type _0x1__coin__BurnCapability = {
  __typename?: '_0x1__coin__BurnCapability';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__coin__Coin = {
  __typename?: '_0x1__coin__Coin';
  value: Scalars['U64'];
};

export type _0x1__coin__CoinInfo = {
  __typename?: '_0x1__coin__CoinInfo';
  decimals: Scalars['U8'];
  name: Scalars['String'];
  supply: Maybe<_0x1__optional_aggregator__OptionalAggregator>;
  symbol: Scalars['String'];
};

export type _0x1__coin__CoinStore = {
  __typename?: '_0x1__coin__CoinStore';
  coin: _0x1__coin__Coin;
  deposit_events: _0x1__event__EventHandle;
  frozen: Scalars['Boolean'];
  withdraw_events: _0x1__event__EventHandle;
};

export type _0x1__coin__DepositEvent = {
  __typename?: '_0x1__coin__DepositEvent';
  amount: Scalars['U64'];
};

export type _0x1__coin__FreezeCapability = {
  __typename?: '_0x1__coin__FreezeCapability';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__coin__MintCapability = {
  __typename?: '_0x1__coin__MintCapability';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__coin__SupplyConfig = {
  __typename?: '_0x1__coin__SupplyConfig';
  allow_upgrades: Scalars['Boolean'];
};

export type _0x1__coin__WithdrawEvent = {
  __typename?: '_0x1__coin__WithdrawEvent';
  amount: Scalars['U64'];
};

export type _0x1__comparator__Result = {
  __typename?: '_0x1__comparator__Result';
  inner: Scalars['U8'];
};

export type _0x1__consensus_config__ConsensusConfig = {
  __typename?: '_0x1__consensus_config__ConsensusConfig';
  config: Array<Scalars['U8']>;
};

export type _0x1__copyable_any__Any = {
  __typename?: '_0x1__copyable_any__Any';
  data: Array<Scalars['U8']>;
  type_name: Scalars['String'];
};

export type _0x1__crypto_algebra__Element = {
  __typename?: '_0x1__crypto_algebra__Element';
  handle: Scalars['U64'];
};

export type _0x1__delegation_pool__AddStakeEvent = {
  __typename?: '_0x1__delegation_pool__AddStakeEvent';
  add_stake_fee: Scalars['U64'];
  amount_added: Scalars['U64'];
  delegator_address: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__delegation_pool__DelegationPool = {
  __typename?: '_0x1__delegation_pool__DelegationPool';
  active_shares: _0x1__pool_u64_unbound__Pool;
  add_stake_events: _0x1__event__EventHandle;
  distribute_commission_events: _0x1__event__EventHandle;
  inactive_shares: _0x1__table__Table;
  observed_lockup_cycle: _0x1__delegation_pool__ObservedLockupCycle;
  operator_commission_percentage: Scalars['U64'];
  pending_withdrawals: _0x1__table__Table;
  reactivate_stake_events: _0x1__event__EventHandle;
  stake_pool_signer_cap: _0x1__account__SignerCapability;
  total_coins_inactive: Scalars['U64'];
  unlock_stake_events: _0x1__event__EventHandle;
  withdraw_stake_events: _0x1__event__EventHandle;
};

export type _0x1__delegation_pool__DelegationPoolOwnership = {
  __typename?: '_0x1__delegation_pool__DelegationPoolOwnership';
  pool_address: Scalars['Address'];
};

export type _0x1__delegation_pool__DistributeCommissionEvent = {
  __typename?: '_0x1__delegation_pool__DistributeCommissionEvent';
  commission_active: Scalars['U64'];
  commission_pending_inactive: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__delegation_pool__ObservedLockupCycle = {
  __typename?: '_0x1__delegation_pool__ObservedLockupCycle';
  index: Scalars['U64'];
};

export type _0x1__delegation_pool__ReactivateStakeEvent = {
  __typename?: '_0x1__delegation_pool__ReactivateStakeEvent';
  amount_reactivated: Scalars['U64'];
  delegator_address: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__delegation_pool__UnlockStakeEvent = {
  __typename?: '_0x1__delegation_pool__UnlockStakeEvent';
  amount_unlocked: Scalars['U64'];
  delegator_address: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__delegation_pool__WithdrawStakeEvent = {
  __typename?: '_0x1__delegation_pool__WithdrawStakeEvent';
  amount_withdrawn: Scalars['U64'];
  delegator_address: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__ed25519__Signature = {
  __typename?: '_0x1__ed25519__Signature';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__ed25519__SignedMessage = {
  __typename?: '_0x1__ed25519__SignedMessage';
  inner: Scalars['Any'];
  type_info: _0x1__type_info__TypeInfo;
};

export type _0x1__ed25519__UnvalidatedPublicKey = {
  __typename?: '_0x1__ed25519__UnvalidatedPublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__ed25519__ValidatedPublicKey = {
  __typename?: '_0x1__ed25519__ValidatedPublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__event__EventHandle = {
  __typename?: '_0x1__event__EventHandle';
  counter: Scalars['U64'];
  guid: _0x1__guid__GUID;
};

export type _0x1__execution_config__ExecutionConfig = {
  __typename?: '_0x1__execution_config__ExecutionConfig';
  config: Array<Scalars['U8']>;
};

export type _0x1__features__Features = {
  __typename?: '_0x1__features__Features';
  features: Array<Scalars['U8']>;
};

export type _0x1__fixed_point32__FixedPoint32 = {
  __typename?: '_0x1__fixed_point32__FixedPoint32';
  value: Scalars['U64'];
};

export type _0x1__fixed_point64__FixedPoint64 = {
  __typename?: '_0x1__fixed_point64__FixedPoint64';
  value: Scalars['U128'];
};

export type _0x1__fungible_asset__BurnRef = {
  __typename?: '_0x1__fungible_asset__BurnRef';
  metadata: _0x1__object__Object;
};

export type _0x1__fungible_asset__DepositEvent = {
  __typename?: '_0x1__fungible_asset__DepositEvent';
  amount: Scalars['U64'];
};

export type _0x1__fungible_asset__FrozenEvent = {
  __typename?: '_0x1__fungible_asset__FrozenEvent';
  frozen: Scalars['Boolean'];
};

export type _0x1__fungible_asset__FungibleAsset = {
  __typename?: '_0x1__fungible_asset__FungibleAsset';
  amount: Scalars['U64'];
  metadata: _0x1__object__Object;
};

export type _0x1__fungible_asset__FungibleAssetEvents = {
  __typename?: '_0x1__fungible_asset__FungibleAssetEvents';
  deposit_events: _0x1__event__EventHandle;
  frozen_events: _0x1__event__EventHandle;
  withdraw_events: _0x1__event__EventHandle;
};

export type _0x1__fungible_asset__FungibleStore = {
  __typename?: '_0x1__fungible_asset__FungibleStore';
  balance: Scalars['U64'];
  frozen: Scalars['Boolean'];
  metadata: _0x1__object__Object;
};

export type _0x1__fungible_asset__Metadata = {
  __typename?: '_0x1__fungible_asset__Metadata';
  decimals: Scalars['U8'];
  icon_uri: Scalars['String'];
  name: Scalars['String'];
  project_uri: Scalars['String'];
  symbol: Scalars['String'];
};

export type _0x1__fungible_asset__MintRef = {
  __typename?: '_0x1__fungible_asset__MintRef';
  metadata: _0x1__object__Object;
};

export type _0x1__fungible_asset__Supply = {
  __typename?: '_0x1__fungible_asset__Supply';
  current: Scalars['U128'];
  maximum: Maybe<Scalars['U128']>;
};

export type _0x1__fungible_asset__TransferRef = {
  __typename?: '_0x1__fungible_asset__TransferRef';
  metadata: _0x1__object__Object;
};

export type _0x1__fungible_asset__WithdrawEvent = {
  __typename?: '_0x1__fungible_asset__WithdrawEvent';
  amount: Scalars['U64'];
};

export type _0x1__gas_schedule__GasEntry = {
  __typename?: '_0x1__gas_schedule__GasEntry';
  key: Scalars['String'];
  val: Scalars['U64'];
};

export type _0x1__gas_schedule__GasSchedule = {
  __typename?: '_0x1__gas_schedule__GasSchedule';
  entries: Array<_0x1__gas_schedule__GasEntry>;
};

export type _0x1__gas_schedule__GasScheduleV2 = {
  __typename?: '_0x1__gas_schedule__GasScheduleV2';
  entries: Array<_0x1__gas_schedule__GasEntry>;
  feature_version: Scalars['U64'];
};

export type _0x1__genesis__AccountMap = {
  __typename?: '_0x1__genesis__AccountMap';
  account_address: Scalars['Address'];
  balance: Scalars['U64'];
};

export type _0x1__genesis__EmployeeAccountMap = {
  __typename?: '_0x1__genesis__EmployeeAccountMap';
  accounts: Array<Scalars['Address']>;
  beneficiary_resetter: Scalars['Address'];
  validator: _0x1__genesis__ValidatorConfigurationWithCommission;
  vesting_schedule_denominator: Scalars['U64'];
  vesting_schedule_numerator: Array<Scalars['U64']>;
};

export type _0x1__genesis__ValidatorConfiguration = {
  __typename?: '_0x1__genesis__ValidatorConfiguration';
  consensus_pubkey: Array<Scalars['U8']>;
  full_node_network_addresses: Array<Scalars['U8']>;
  network_addresses: Array<Scalars['U8']>;
  operator_address: Scalars['Address'];
  owner_address: Scalars['Address'];
  proof_of_possession: Array<Scalars['U8']>;
  stake_amount: Scalars['U64'];
  voter_address: Scalars['Address'];
};

export type _0x1__genesis__ValidatorConfigurationWithCommission = {
  __typename?: '_0x1__genesis__ValidatorConfigurationWithCommission';
  commission_percentage: Scalars['U64'];
  join_during_genesis: Scalars['Boolean'];
  validator_config: _0x1__genesis__ValidatorConfiguration;
};

export type _0x1__governance_proposal__GovernanceProposal = {
  __typename?: '_0x1__governance_proposal__GovernanceProposal';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__guid__GUID = {
  __typename?: '_0x1__guid__GUID';
  id: _0x1__guid__ID;
};

export type _0x1__guid__ID = {
  __typename?: '_0x1__guid__ID';
  addr: Scalars['Address'];
  creation_num: Scalars['U64'];
};

export type _0x1__managed_coin__Capabilities = {
  __typename?: '_0x1__managed_coin__Capabilities';
  burn_cap: _0x1__coin__BurnCapability;
  freeze_cap: _0x1__coin__FreezeCapability;
  mint_cap: _0x1__coin__MintCapability;
};

export type _0x1__multi_ed25519__Signature = {
  __typename?: '_0x1__multi_ed25519__Signature';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__multi_ed25519__UnvalidatedPublicKey = {
  __typename?: '_0x1__multi_ed25519__UnvalidatedPublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__multi_ed25519__ValidatedPublicKey = {
  __typename?: '_0x1__multi_ed25519__ValidatedPublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__multisig_account__AddOwnersEvent = {
  __typename?: '_0x1__multisig_account__AddOwnersEvent';
  owners_added: Array<Scalars['Address']>;
};

export type _0x1__multisig_account__CreateTransactionEvent = {
  __typename?: '_0x1__multisig_account__CreateTransactionEvent';
  creator: Scalars['Address'];
  sequence_number: Scalars['U64'];
  transaction: _0x1__multisig_account__MultisigTransaction;
};

export type _0x1__multisig_account__ExecuteRejectedTransactionEvent = {
  __typename?: '_0x1__multisig_account__ExecuteRejectedTransactionEvent';
  executor: Scalars['Address'];
  num_rejections: Scalars['U64'];
  sequence_number: Scalars['U64'];
};

export type _0x1__multisig_account__ExecutionError = {
  __typename?: '_0x1__multisig_account__ExecutionError';
  abort_location: Scalars['String'];
  error_code: Scalars['U64'];
  error_type: Scalars['String'];
};

export type _0x1__multisig_account__MetadataUpdatedEvent = {
  __typename?: '_0x1__multisig_account__MetadataUpdatedEvent';
  new_metadata: _0x1__simple_map__SimpleMap;
  old_metadata: _0x1__simple_map__SimpleMap;
};

export type _0x1__multisig_account__MultisigAccount = {
  __typename?: '_0x1__multisig_account__MultisigAccount';
  add_owners_events: _0x1__event__EventHandle;
  create_transaction_events: _0x1__event__EventHandle;
  execute_rejected_transaction_events: _0x1__event__EventHandle;
  execute_transaction_events: _0x1__event__EventHandle;
  last_executed_sequence_number: Scalars['U64'];
  metadata: _0x1__simple_map__SimpleMap;
  metadata_updated_events: _0x1__event__EventHandle;
  next_sequence_number: Scalars['U64'];
  num_signatures_required: Scalars['U64'];
  owners: Array<Scalars['Address']>;
  remove_owners_events: _0x1__event__EventHandle;
  signer_cap: Maybe<_0x1__account__SignerCapability>;
  transaction_execution_failed_events: _0x1__event__EventHandle;
  transactions: _0x1__table__Table;
  update_signature_required_events: _0x1__event__EventHandle;
  vote_events: _0x1__event__EventHandle;
};

export type _0x1__multisig_account__MultisigAccountCreationMessage = {
  __typename?: '_0x1__multisig_account__MultisigAccountCreationMessage';
  account_address: Scalars['Address'];
  chain_id: Scalars['U8'];
  num_signatures_required: Scalars['U64'];
  owners: Array<Scalars['Address']>;
  sequence_number: Scalars['U64'];
};

export type _0x1__multisig_account__MultisigTransaction = {
  __typename?: '_0x1__multisig_account__MultisigTransaction';
  creation_time_secs: Scalars['U64'];
  creator: Scalars['Address'];
  payload: Maybe<Array<Scalars['U8']>>;
  payload_hash: Maybe<Array<Scalars['U8']>>;
  votes: _0x1__simple_map__SimpleMap;
};

export type _0x1__multisig_account__RemoveOwnersEvent = {
  __typename?: '_0x1__multisig_account__RemoveOwnersEvent';
  owners_removed: Array<Scalars['Address']>;
};

export type _0x1__multisig_account__TransactionExecutionFailedEvent = {
  __typename?: '_0x1__multisig_account__TransactionExecutionFailedEvent';
  execution_error: _0x1__multisig_account__ExecutionError;
  executor: Scalars['Address'];
  num_approvals: Scalars['U64'];
  sequence_number: Scalars['U64'];
  transaction_payload: Array<Scalars['U8']>;
};

export type _0x1__multisig_account__TransactionExecutionSucceededEvent = {
  __typename?: '_0x1__multisig_account__TransactionExecutionSucceededEvent';
  executor: Scalars['Address'];
  num_approvals: Scalars['U64'];
  sequence_number: Scalars['U64'];
  transaction_payload: Array<Scalars['U8']>;
};

export type _0x1__multisig_account__UpdateSignaturesRequiredEvent = {
  __typename?: '_0x1__multisig_account__UpdateSignaturesRequiredEvent';
  new_num_signatures_required: Scalars['U64'];
  old_num_signatures_required: Scalars['U64'];
};

export type _0x1__multisig_account__VoteEvent = {
  __typename?: '_0x1__multisig_account__VoteEvent';
  approved: Scalars['Boolean'];
  owner: Scalars['Address'];
  sequence_number: Scalars['U64'];
};

export type _0x1__object__ConstructorRef = {
  __typename?: '_0x1__object__ConstructorRef';
  can_delete: Scalars['Boolean'];
  self: Scalars['Address'];
};

export type _0x1__object__DeleteRef = {
  __typename?: '_0x1__object__DeleteRef';
  self: Scalars['Address'];
};

export type _0x1__object__DeriveRef = {
  __typename?: '_0x1__object__DeriveRef';
  self: Scalars['Address'];
};

export type _0x1__object__ExtendRef = {
  __typename?: '_0x1__object__ExtendRef';
  self: Scalars['Address'];
};

export type _0x1__object__LinearTransferRef = {
  __typename?: '_0x1__object__LinearTransferRef';
  owner: Scalars['Address'];
  self: Scalars['Address'];
};

export type _0x1__object__Object = {
  __typename?: '_0x1__object__Object';
  inner: Scalars['Address'];
};

export type _0x1__object__ObjectCore = {
  __typename?: '_0x1__object__ObjectCore';
  allow_ungated_transfer: Scalars['Boolean'];
  guid_creation_num: Scalars['U64'];
  owner: Scalars['Address'];
  transfer_events: _0x1__event__EventHandle;
};

export type _0x1__object__ObjectGroup = {
  __typename?: '_0x1__object__ObjectGroup';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__object__TransferEvent = {
  __typename?: '_0x1__object__TransferEvent';
  from: Scalars['Address'];
  object: Scalars['Address'];
  to: Scalars['Address'];
};

export type _0x1__object__TransferRef = {
  __typename?: '_0x1__object__TransferRef';
  self: Scalars['Address'];
};

export type _0x1__option__Option = {
  __typename?: '_0x1__option__Option';
  vec: Array<Scalars['Any']>;
};

export type _0x1__optional_aggregator__Integer = {
  __typename?: '_0x1__optional_aggregator__Integer';
  limit: Scalars['U128'];
  value: Scalars['U128'];
};

export type _0x1__optional_aggregator__OptionalAggregator = {
  __typename?: '_0x1__optional_aggregator__OptionalAggregator';
  aggregator: Maybe<_0x1__aggregator__Aggregator>;
  integer: Maybe<_0x1__optional_aggregator__Integer>;
};

export type _0x1__pool_u64__Pool = {
  __typename?: '_0x1__pool_u64__Pool';
  scaling_factor: Scalars['U64'];
  shareholders: Array<Scalars['Address']>;
  shareholders_limit: Scalars['U64'];
  shares: _0x1__simple_map__SimpleMap;
  total_coins: Scalars['U64'];
  total_shares: Scalars['U64'];
};

export type _0x1__pool_u64_unbound__Pool = {
  __typename?: '_0x1__pool_u64_unbound__Pool';
  scaling_factor: Scalars['U64'];
  shares: _0x1__table_with_length__TableWithLength;
  total_coins: Scalars['U64'];
  total_shares: Scalars['U128'];
};

export type _0x1__primary_fungible_store__DeriveRefPod = {
  __typename?: '_0x1__primary_fungible_store__DeriveRefPod';
  metadata_derive_ref: _0x1__object__DeriveRef;
};

export type _0x1__reconfiguration__Configuration = {
  __typename?: '_0x1__reconfiguration__Configuration';
  epoch: Scalars['U64'];
  events: _0x1__event__EventHandle;
  last_reconfiguration_time: Scalars['U64'];
};

export type _0x1__reconfiguration__DisableReconfiguration = {
  __typename?: '_0x1__reconfiguration__DisableReconfiguration';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__reconfiguration__NewEpochEvent = {
  __typename?: '_0x1__reconfiguration__NewEpochEvent';
  epoch: Scalars['U64'];
};

export type _0x1__resource_account__Container = {
  __typename?: '_0x1__resource_account__Container';
  store: _0x1__simple_map__SimpleMap;
};

export type _0x1__ristretto255__CompressedRistretto = {
  __typename?: '_0x1__ristretto255__CompressedRistretto';
  data: Array<Scalars['U8']>;
};

export type _0x1__ristretto255__RistrettoPoint = {
  __typename?: '_0x1__ristretto255__RistrettoPoint';
  handle: Scalars['U64'];
};

export type _0x1__ristretto255__Scalar = {
  __typename?: '_0x1__ristretto255__Scalar';
  data: Array<Scalars['U8']>;
};

export type _0x1__secp256k1__ECDSARawPublicKey = {
  __typename?: '_0x1__secp256k1__ECDSARawPublicKey';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__secp256k1__ECDSASignature = {
  __typename?: '_0x1__secp256k1__ECDSASignature';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__simple_map__Element = {
  __typename?: '_0x1__simple_map__Element';
  key: Scalars['Any'];
  value: Scalars['Any'];
};

export type _0x1__simple_map__SimpleMap = {
  __typename?: '_0x1__simple_map__SimpleMap';
  data: Array<_0x1__simple_map__Element>;
};

export type _0x1__smart_table__Entry = {
  __typename?: '_0x1__smart_table__Entry';
  hash: Scalars['U64'];
  key: Scalars['Any'];
  value: Scalars['Any'];
};

export type _0x1__smart_table__SmartTable = {
  __typename?: '_0x1__smart_table__SmartTable';
  buckets: _0x1__table_with_length__TableWithLength;
  level: Scalars['U8'];
  num_buckets: Scalars['U64'];
  size: Scalars['U64'];
  split_load_threshold: Scalars['U8'];
  target_bucket_size: Scalars['U64'];
};

export type _0x1__smart_vector__SmartVector = {
  __typename?: '_0x1__smart_vector__SmartVector';
  big_vec: Maybe<_0x1__big_vector__BigVector>;
  bucket_size: Maybe<Scalars['U64']>;
  inline_capacity: Maybe<Scalars['U64']>;
  inline_vec: Array<Scalars['Any']>;
};

export type _0x1__stake__AddStakeEvent = {
  __typename?: '_0x1__stake__AddStakeEvent';
  amount_added: Scalars['U64'];
  pool_address: Scalars['Address'];
};

export type _0x1__stake__AllowedValidators = {
  __typename?: '_0x1__stake__AllowedValidators';
  accounts: Array<Scalars['Address']>;
};

export type _0x1__stake__AptosCoinCapabilities = {
  __typename?: '_0x1__stake__AptosCoinCapabilities';
  mint_cap: _0x1__coin__MintCapability;
};

export type _0x1__stake__DistributeRewardsEvent = {
  __typename?: '_0x1__stake__DistributeRewardsEvent';
  pool_address: Scalars['Address'];
  rewards_amount: Scalars['U64'];
};

export type _0x1__stake__IncreaseLockupEvent = {
  __typename?: '_0x1__stake__IncreaseLockupEvent';
  new_locked_until_secs: Scalars['U64'];
  old_locked_until_secs: Scalars['U64'];
  pool_address: Scalars['Address'];
};

export type _0x1__stake__IndividualValidatorPerformance = {
  __typename?: '_0x1__stake__IndividualValidatorPerformance';
  failed_proposals: Scalars['U64'];
  successful_proposals: Scalars['U64'];
};

export type _0x1__stake__JoinValidatorSetEvent = {
  __typename?: '_0x1__stake__JoinValidatorSetEvent';
  pool_address: Scalars['Address'];
};

export type _0x1__stake__LeaveValidatorSetEvent = {
  __typename?: '_0x1__stake__LeaveValidatorSetEvent';
  pool_address: Scalars['Address'];
};

export type _0x1__stake__OwnerCapability = {
  __typename?: '_0x1__stake__OwnerCapability';
  pool_address: Scalars['Address'];
};

export type _0x1__stake__ReactivateStakeEvent = {
  __typename?: '_0x1__stake__ReactivateStakeEvent';
  amount: Scalars['U64'];
  pool_address: Scalars['Address'];
};

export type _0x1__stake__RegisterValidatorCandidateEvent = {
  __typename?: '_0x1__stake__RegisterValidatorCandidateEvent';
  pool_address: Scalars['Address'];
};

export type _0x1__stake__RotateConsensusKeyEvent = {
  __typename?: '_0x1__stake__RotateConsensusKeyEvent';
  new_consensus_pubkey: Array<Scalars['U8']>;
  old_consensus_pubkey: Array<Scalars['U8']>;
  pool_address: Scalars['Address'];
};

export type _0x1__stake__SetOperatorEvent = {
  __typename?: '_0x1__stake__SetOperatorEvent';
  new_operator: Scalars['Address'];
  old_operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__stake__StakePool = {
  __typename?: '_0x1__stake__StakePool';
  active: _0x1__coin__Coin;
  add_stake_events: _0x1__event__EventHandle;
  delegated_voter: Scalars['Address'];
  distribute_rewards_events: _0x1__event__EventHandle;
  inactive: _0x1__coin__Coin;
  increase_lockup_events: _0x1__event__EventHandle;
  initialize_validator_events: _0x1__event__EventHandle;
  join_validator_set_events: _0x1__event__EventHandle;
  leave_validator_set_events: _0x1__event__EventHandle;
  locked_until_secs: Scalars['U64'];
  operator_address: Scalars['Address'];
  pending_active: _0x1__coin__Coin;
  pending_inactive: _0x1__coin__Coin;
  reactivate_stake_events: _0x1__event__EventHandle;
  rotate_consensus_key_events: _0x1__event__EventHandle;
  set_operator_events: _0x1__event__EventHandle;
  unlock_stake_events: _0x1__event__EventHandle;
  update_network_and_fullnode_addresses_events: _0x1__event__EventHandle;
  withdraw_stake_events: _0x1__event__EventHandle;
};

export type _0x1__stake__UnlockStakeEvent = {
  __typename?: '_0x1__stake__UnlockStakeEvent';
  amount_unlocked: Scalars['U64'];
  pool_address: Scalars['Address'];
};

export type _0x1__stake__UpdateNetworkAndFullnodeAddressesEvent = {
  __typename?: '_0x1__stake__UpdateNetworkAndFullnodeAddressesEvent';
  new_fullnode_addresses: Array<Scalars['U8']>;
  new_network_addresses: Array<Scalars['U8']>;
  old_fullnode_addresses: Array<Scalars['U8']>;
  old_network_addresses: Array<Scalars['U8']>;
  pool_address: Scalars['Address'];
};

export type _0x1__stake__ValidatorConfig = {
  __typename?: '_0x1__stake__ValidatorConfig';
  consensus_pubkey: Array<Scalars['U8']>;
  fullnode_addresses: Array<Scalars['U8']>;
  network_addresses: Array<Scalars['U8']>;
  validator_index: Scalars['U64'];
};

export type _0x1__stake__ValidatorFees = {
  __typename?: '_0x1__stake__ValidatorFees';
  fees_table: _0x1__table__Table;
};

export type _0x1__stake__ValidatorInfo = {
  __typename?: '_0x1__stake__ValidatorInfo';
  addr: Scalars['Address'];
  config: _0x1__stake__ValidatorConfig;
  voting_power: Scalars['U64'];
};

export type _0x1__stake__ValidatorPerformance = {
  __typename?: '_0x1__stake__ValidatorPerformance';
  validators: Array<_0x1__stake__IndividualValidatorPerformance>;
};

export type _0x1__stake__ValidatorSet = {
  __typename?: '_0x1__stake__ValidatorSet';
  active_validators: Array<_0x1__stake__ValidatorInfo>;
  consensus_scheme: Scalars['U8'];
  pending_active: Array<_0x1__stake__ValidatorInfo>;
  pending_inactive: Array<_0x1__stake__ValidatorInfo>;
  total_joining_power: Scalars['U128'];
  total_voting_power: Scalars['U128'];
};

export type _0x1__stake__WithdrawStakeEvent = {
  __typename?: '_0x1__stake__WithdrawStakeEvent';
  amount_withdrawn: Scalars['U64'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_config__StakingConfig = {
  __typename?: '_0x1__staking_config__StakingConfig';
  allow_validator_set_change: Scalars['Boolean'];
  maximum_stake: Scalars['U64'];
  minimum_stake: Scalars['U64'];
  recurring_lockup_duration_secs: Scalars['U64'];
  rewards_rate: Scalars['U64'];
  rewards_rate_denominator: Scalars['U64'];
  voting_power_increase_limit: Scalars['U64'];
};

export type _0x1__staking_config__StakingRewardsConfig = {
  __typename?: '_0x1__staking_config__StakingRewardsConfig';
  last_rewards_rate_period_start_in_secs: Scalars['U64'];
  min_rewards_rate: _0x1__fixed_point64__FixedPoint64;
  rewards_rate: _0x1__fixed_point64__FixedPoint64;
  rewards_rate_decrease_rate: _0x1__fixed_point64__FixedPoint64;
  rewards_rate_period_in_secs: Scalars['U64'];
};

export type _0x1__staking_contract__AddDistributionEvent = {
  __typename?: '_0x1__staking_contract__AddDistributionEvent';
  amount: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__AddStakeEvent = {
  __typename?: '_0x1__staking_contract__AddStakeEvent';
  amount: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__CreateStakingContractEvent = {
  __typename?: '_0x1__staking_contract__CreateStakingContractEvent';
  commission_percentage: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
  principal: Scalars['U64'];
  voter: Scalars['Address'];
};

export type _0x1__staking_contract__DistributeEvent = {
  __typename?: '_0x1__staking_contract__DistributeEvent';
  amount: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
  recipient: Scalars['Address'];
};

export type _0x1__staking_contract__RequestCommissionEvent = {
  __typename?: '_0x1__staking_contract__RequestCommissionEvent';
  accumulated_rewards: Scalars['U64'];
  commission_amount: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__ResetLockupEvent = {
  __typename?: '_0x1__staking_contract__ResetLockupEvent';
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__StakingContract = {
  __typename?: '_0x1__staking_contract__StakingContract';
  commission_percentage: Scalars['U64'];
  distribution_pool: _0x1__pool_u64__Pool;
  owner_cap: _0x1__stake__OwnerCapability;
  pool_address: Scalars['Address'];
  principal: Scalars['U64'];
  signer_cap: _0x1__account__SignerCapability;
};

export type _0x1__staking_contract__StakingGroupContainer = {
  __typename?: '_0x1__staking_contract__StakingGroupContainer';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__staking_contract__StakingGroupUpdateCommissionEvent = {
  __typename?: '_0x1__staking_contract__StakingGroupUpdateCommissionEvent';
  update_commission_events: _0x1__event__EventHandle;
};

export type _0x1__staking_contract__Store = {
  __typename?: '_0x1__staking_contract__Store';
  add_distribution_events: _0x1__event__EventHandle;
  add_stake_events: _0x1__event__EventHandle;
  create_staking_contract_events: _0x1__event__EventHandle;
  distribute_events: _0x1__event__EventHandle;
  request_commission_events: _0x1__event__EventHandle;
  reset_lockup_events: _0x1__event__EventHandle;
  staking_contracts: _0x1__simple_map__SimpleMap;
  switch_operator_events: _0x1__event__EventHandle;
  unlock_stake_events: _0x1__event__EventHandle;
  update_voter_events: _0x1__event__EventHandle;
};

export type _0x1__staking_contract__SwitchOperatorEvent = {
  __typename?: '_0x1__staking_contract__SwitchOperatorEvent';
  new_operator: Scalars['Address'];
  old_operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__UnlockStakeEvent = {
  __typename?: '_0x1__staking_contract__UnlockStakeEvent';
  amount: Scalars['U64'];
  commission_paid: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__staking_contract__UpdateCommissionEvent = {
  __typename?: '_0x1__staking_contract__UpdateCommissionEvent';
  new_commission_percentage: Scalars['U64'];
  old_commission_percentage: Scalars['U64'];
  operator: Scalars['Address'];
  staker: Scalars['Address'];
};

export type _0x1__staking_contract__UpdateVoterEvent = {
  __typename?: '_0x1__staking_contract__UpdateVoterEvent';
  new_voter: Scalars['Address'];
  old_voter: Scalars['Address'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
};

export type _0x1__state_storage__GasParameter = {
  __typename?: '_0x1__state_storage__GasParameter';
  usage: _0x1__state_storage__Usage;
};

export type _0x1__state_storage__StateStorageUsage = {
  __typename?: '_0x1__state_storage__StateStorageUsage';
  epoch: Scalars['U64'];
  usage: _0x1__state_storage__Usage;
};

export type _0x1__state_storage__Usage = {
  __typename?: '_0x1__state_storage__Usage';
  bytes: Scalars['U64'];
  items: Scalars['U64'];
};

export type _0x1__storage_gas__GasCurve = {
  __typename?: '_0x1__storage_gas__GasCurve';
  max_gas: Scalars['U64'];
  min_gas: Scalars['U64'];
  points: Array<_0x1__storage_gas__Point>;
};

export type _0x1__storage_gas__Point = {
  __typename?: '_0x1__storage_gas__Point';
  x: Scalars['U64'];
  y: Scalars['U64'];
};

export type _0x1__storage_gas__StorageGas = {
  __typename?: '_0x1__storage_gas__StorageGas';
  per_byte_create: Scalars['U64'];
  per_byte_read: Scalars['U64'];
  per_byte_write: Scalars['U64'];
  per_item_create: Scalars['U64'];
  per_item_read: Scalars['U64'];
  per_item_write: Scalars['U64'];
};

export type _0x1__storage_gas__StorageGasConfig = {
  __typename?: '_0x1__storage_gas__StorageGasConfig';
  byte_config: _0x1__storage_gas__UsageGasConfig;
  item_config: _0x1__storage_gas__UsageGasConfig;
};

export type _0x1__storage_gas__UsageGasConfig = {
  __typename?: '_0x1__storage_gas__UsageGasConfig';
  create_curve: _0x1__storage_gas__GasCurve;
  read_curve: _0x1__storage_gas__GasCurve;
  target_usage: Scalars['U64'];
  write_curve: _0x1__storage_gas__GasCurve;
};

export type _0x1__string__String = {
  __typename?: '_0x1__string__String';
  bytes: Array<Scalars['U8']>;
};

export type _0x1__string_utils__Cons = {
  __typename?: '_0x1__string_utils__Cons';
  car: Scalars['Any'];
  cdr: Scalars['Any'];
};

export type _0x1__string_utils__FakeCons = {
  __typename?: '_0x1__string_utils__FakeCons';
  car: Scalars['Any'];
  cdr: Scalars['Any'];
};

export type _0x1__string_utils__NIL = {
  __typename?: '_0x1__string_utils__NIL';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__table__Box = {
  __typename?: '_0x1__table__Box';
  val: Scalars['Any'];
};

export type _0x1__table__Table = {
  __typename?: '_0x1__table__Table';
  handle: Scalars['Address'];
};

export type _0x1__table_with_length__TableWithLength = {
  __typename?: '_0x1__table_with_length__TableWithLength';
  inner: _0x1__table__Table;
  length: Scalars['U64'];
};

export type _0x1__timestamp__CurrentTimeMicroseconds = {
  __typename?: '_0x1__timestamp__CurrentTimeMicroseconds';
  microseconds: Scalars['U64'];
};

export type _0x1__transaction_fee__AptosCoinCapabilities = {
  __typename?: '_0x1__transaction_fee__AptosCoinCapabilities';
  burn_cap: _0x1__coin__BurnCapability;
};

export type _0x1__transaction_fee__CollectedFeesPerBlock = {
  __typename?: '_0x1__transaction_fee__CollectedFeesPerBlock';
  amount: _0x1__coin__AggregatableCoin;
  burn_percentage: Scalars['U8'];
  proposer: Maybe<Scalars['Address']>;
};

export type _0x1__transaction_validation__TransactionValidation = {
  __typename?: '_0x1__transaction_validation__TransactionValidation';
  module_addr: Scalars['Address'];
  module_name: Array<Scalars['U8']>;
  module_prologue_name: Array<Scalars['U8']>;
  multi_agent_prologue_name: Array<Scalars['U8']>;
  script_prologue_name: Array<Scalars['U8']>;
  user_epilogue_name: Array<Scalars['U8']>;
};

export type _0x1__type_info__TypeInfo = {
  __typename?: '_0x1__type_info__TypeInfo';
  account_address: Scalars['Address'];
  module_name: Array<Scalars['U8']>;
  struct_name: Array<Scalars['U8']>;
};

export type _0x1__version__SetVersionCapability = {
  __typename?: '_0x1__version__SetVersionCapability';
  dummy_field: Scalars['Boolean'];
};

export type _0x1__version__Version = {
  __typename?: '_0x1__version__Version';
  major: Scalars['U64'];
};

export type _0x1__vesting__AdminStore = {
  __typename?: '_0x1__vesting__AdminStore';
  create_events: _0x1__event__EventHandle;
  nonce: Scalars['U64'];
  vesting_contracts: Array<Scalars['Address']>;
};

export type _0x1__vesting__AdminWithdrawEvent = {
  __typename?: '_0x1__vesting__AdminWithdrawEvent';
  admin: Scalars['Address'];
  amount: Scalars['U64'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__CreateVestingContractEvent = {
  __typename?: '_0x1__vesting__CreateVestingContractEvent';
  commission_percentage: Scalars['U64'];
  grant_amount: Scalars['U64'];
  operator: Scalars['Address'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
  voter: Scalars['Address'];
  withdrawal_address: Scalars['Address'];
};

export type _0x1__vesting__DistributeEvent = {
  __typename?: '_0x1__vesting__DistributeEvent';
  admin: Scalars['Address'];
  amount: Scalars['U64'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__ResetLockupEvent = {
  __typename?: '_0x1__vesting__ResetLockupEvent';
  admin: Scalars['Address'];
  new_lockup_expiration_secs: Scalars['U64'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__SetBeneficiaryEvent = {
  __typename?: '_0x1__vesting__SetBeneficiaryEvent';
  admin: Scalars['Address'];
  new_beneficiary: Scalars['Address'];
  old_beneficiary: Scalars['Address'];
  shareholder: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__StakingInfo = {
  __typename?: '_0x1__vesting__StakingInfo';
  commission_percentage: Scalars['U64'];
  operator: Scalars['Address'];
  pool_address: Scalars['Address'];
  voter: Scalars['Address'];
};

export type _0x1__vesting__TerminateEvent = {
  __typename?: '_0x1__vesting__TerminateEvent';
  admin: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__UnlockRewardsEvent = {
  __typename?: '_0x1__vesting__UnlockRewardsEvent';
  admin: Scalars['Address'];
  amount: Scalars['U64'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__UpdateOperatorEvent = {
  __typename?: '_0x1__vesting__UpdateOperatorEvent';
  admin: Scalars['Address'];
  commission_percentage: Scalars['U64'];
  new_operator: Scalars['Address'];
  old_operator: Scalars['Address'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__UpdateVoterEvent = {
  __typename?: '_0x1__vesting__UpdateVoterEvent';
  admin: Scalars['Address'];
  new_voter: Scalars['Address'];
  old_voter: Scalars['Address'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__VestEvent = {
  __typename?: '_0x1__vesting__VestEvent';
  admin: Scalars['Address'];
  amount: Scalars['U64'];
  period_vested: Scalars['U64'];
  staking_pool_address: Scalars['Address'];
  vesting_contract_address: Scalars['Address'];
};

export type _0x1__vesting__VestingAccountManagement = {
  __typename?: '_0x1__vesting__VestingAccountManagement';
  roles: _0x1__simple_map__SimpleMap;
};

export type _0x1__vesting__VestingContract = {
  __typename?: '_0x1__vesting__VestingContract';
  admin: Scalars['Address'];
  admin_withdraw_events: _0x1__event__EventHandle;
  beneficiaries: _0x1__simple_map__SimpleMap;
  distribute_events: _0x1__event__EventHandle;
  grant_pool: _0x1__pool_u64__Pool;
  remaining_grant: Scalars['U64'];
  reset_lockup_events: _0x1__event__EventHandle;
  set_beneficiary_events: _0x1__event__EventHandle;
  signer_cap: _0x1__account__SignerCapability;
  staking: _0x1__vesting__StakingInfo;
  state: Scalars['U64'];
  terminate_events: _0x1__event__EventHandle;
  unlock_rewards_events: _0x1__event__EventHandle;
  update_operator_events: _0x1__event__EventHandle;
  update_voter_events: _0x1__event__EventHandle;
  vest_events: _0x1__event__EventHandle;
  vesting_schedule: _0x1__vesting__VestingSchedule;
  withdrawal_address: Scalars['Address'];
};

export type _0x1__vesting__VestingSchedule = {
  __typename?: '_0x1__vesting__VestingSchedule';
  last_vested_period: Scalars['U64'];
  period_duration: Scalars['U64'];
  schedule: Array<_0x1__fixed_point32__FixedPoint32>;
  start_timestamp_secs: Scalars['U64'];
};

export type _0x1__voting__CreateProposalEvent = {
  __typename?: '_0x1__voting__CreateProposalEvent';
  early_resolution_vote_threshold: Maybe<Scalars['U128']>;
  execution_hash: Array<Scalars['U8']>;
  expiration_secs: Scalars['U64'];
  metadata: _0x1__simple_map__SimpleMap;
  min_vote_threshold: Scalars['U128'];
  proposal_id: Scalars['U64'];
};

export type _0x1__voting__Proposal = {
  __typename?: '_0x1__voting__Proposal';
  creation_time_secs: Scalars['U64'];
  early_resolution_vote_threshold: Maybe<Scalars['U128']>;
  execution_content: Maybe<Scalars['Address']>;
  execution_hash: Array<Scalars['U8']>;
  expiration_secs: Scalars['U64'];
  is_resolved: Scalars['Boolean'];
  metadata: _0x1__simple_map__SimpleMap;
  min_vote_threshold: Scalars['U128'];
  no_votes: Scalars['U128'];
  proposer: Scalars['Address'];
  resolution_time_secs: Scalars['U64'];
  yes_votes: Scalars['U128'];
};

export type _0x1__voting__RegisterForumEvent = {
  __typename?: '_0x1__voting__RegisterForumEvent';
  hosting_account: Scalars['Address'];
  proposal_type_info: _0x1__type_info__TypeInfo;
};

export type _0x1__voting__ResolveProposal = {
  __typename?: '_0x1__voting__ResolveProposal';
  no_votes: Scalars['U128'];
  proposal_id: Scalars['U64'];
  resolved_early: Scalars['Boolean'];
  yes_votes: Scalars['U128'];
};

export type _0x1__voting__VoteEvent = {
  __typename?: '_0x1__voting__VoteEvent';
  num_votes: Scalars['U64'];
  proposal_id: Scalars['U64'];
};

export type _0x1__voting__VotingEvents = {
  __typename?: '_0x1__voting__VotingEvents';
  create_proposal_events: _0x1__event__EventHandle;
  register_forum_events: _0x1__event__EventHandle;
  resolve_proposal_events: _0x1__event__EventHandle;
  vote_events: _0x1__event__EventHandle;
};

export type _0x1__voting__VotingForum = {
  __typename?: '_0x1__voting__VotingForum';
  events: _0x1__voting__VotingEvents;
  next_proposal_id: Scalars['U64'];
  proposals: _0x1__table__Table;
};

export type _0x3__tontine07__FallbackExecutedEvent = {
  __typename?: '_0x3__tontine07__FallbackExecutedEvent';
  dummy_field: Scalars['Boolean'];
};

export type _0x3__tontine07__FundsClaimedEvent = {
  __typename?: '_0x3__tontine07__FundsClaimedEvent';
  member: Scalars['Address'];
};

export type _0x3__tontine07__MemberCheckedInEvent = {
  __typename?: '_0x3__tontine07__MemberCheckedInEvent';
  member: Scalars['Address'];
};

export type _0x3__tontine07__MemberContributedEvent = {
  __typename?: '_0x3__tontine07__MemberContributedEvent';
  amount_octa: Scalars['U64'];
  member: Scalars['Address'];
};

export type _0x3__tontine07__MemberData = {
  __typename?: '_0x3__tontine07__MemberData';
  contributed_octa: Scalars['U64'];
  last_check_in_time_secs: Maybe<Scalars['U64']>;
  reconfirmation_required: Scalars['Boolean'];
};

export type _0x3__tontine07__MemberInvitedEvent = {
  __typename?: '_0x3__tontine07__MemberInvitedEvent';
  member: Scalars['Address'];
};

export type _0x3__tontine07__MemberLeftEvent = {
  __typename?: '_0x3__tontine07__MemberLeftEvent';
  member: Scalars['Address'];
  removed: Scalars['Boolean'];
};

export type _0x3__tontine07__MemberRemovedEvent = {
  __typename?: '_0x3__tontine07__MemberRemovedEvent';
  member: Scalars['Address'];
};

export type _0x3__tontine07__MemberWithdrewEvent = {
  __typename?: '_0x3__tontine07__MemberWithdrewEvent';
  amount_octa: Scalars['U64'];
  member: Scalars['Address'];
};

export type _0x3__tontine07__Testing = {
  __typename?: '_0x3__tontine07__Testing';
  blah: Maybe<Array<Array<Maybe<Array<Scalars['U32']>>>>>;
};

export type _0x3__tontine07__Tontine = {
  __typename?: '_0x3__tontine07__Tontine';
  config: _0x3__tontine07__TontineConfig;
  creation_time_secs: Scalars['U64'];
  delete_ref: _0x1__object__DeleteRef;
  fallback_executed: Scalars['Boolean'];
  fallback_executed_events: _0x1__event__EventHandle;
  funds_account_signer_cap: _0x1__account__SignerCapability;
  funds_claimed_by: Maybe<Scalars['Address']>;
  funds_claimed_events: _0x1__event__EventHandle;
  funds_claimed_secs: Scalars['U64'];
  locked_time_secs: Scalars['U64'];
  member_checked_in_events: _0x1__event__EventHandle;
  member_contributed_events: _0x1__event__EventHandle;
  member_data: _0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__SimpleMap;
  member_invited_events: _0x1__event__EventHandle;
  member_left_events: _0x1__event__EventHandle;
  member_removed_events: _0x1__event__EventHandle;
  member_withdrew_events: _0x1__event__EventHandle;
  tontine_created_events: _0x1__event__EventHandle;
  tontine_locked_events: _0x1__event__EventHandle;
};

export type _0x3__tontine07__TontineConfig = {
  __typename?: '_0x3__tontine07__TontineConfig';
  check_in_frequency_secs: Scalars['U64'];
  claim_window_secs: Scalars['U64'];
  delegation_pool: Maybe<Scalars['Address']>;
  description: Scalars['String'];
  fallback_policy: _0x3__tontine07__TontineFallbackPolicy;
  per_member_amount_octa: Scalars['U64'];
};

export type _0x3__tontine07__TontineCreatedEvent = {
  __typename?: '_0x3__tontine07__TontineCreatedEvent';
  creator: Scalars['Address'];
};

export type _0x3__tontine07__TontineFallbackPolicy = {
  __typename?: '_0x3__tontine07__TontineFallbackPolicy';
  policy: Scalars['U8'];
};

export type _0x3__tontine07__TontineLockedEvent = {
  __typename?: '_0x3__tontine07__TontineLockedEvent';
  dummy_field: Scalars['Boolean'];
};

export type _0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__Element = {
  __typename?: '_0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__Element';
  key: Scalars['Any'];
  value: Scalars['Any'];
};

export type _0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__SimpleMap = {
  __typename?: '_0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__SimpleMap';
  data: Array<_0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_map__Element>;
};

export type _0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_set__SimpleSet = {
  __typename?: '_0x626b96faa14f38242ec223e214101791920325665f4f7fc25f8865d6338b0053__simple_set__SimpleSet';
  data: Array<Scalars['Any']>;
};
