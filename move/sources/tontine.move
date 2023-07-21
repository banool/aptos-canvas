// Copyright (c) Daniel Porteous
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this tontine module works.

module addr::tontine07 {
    use std::error;
    use std::option::{Self, Option};
    use std::signer;
    use std::string;
    use std::vector;
    use std::timestamp::now_seconds;
    use aptos_framework::account::{Self, SignerCapability};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::coin::Self;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::delegation_pool;
    use aptos_framework::stake;
    use aptos_framework::staking_config;
    use aptos_std::object::{Self, DeleteRef, Object};
    use dport_std::simple_map::{Self, SimpleMap};

    /// The `invitees` list was empty.
    const E_CREATION_INVITEES_EMPTY: u64 = 1;

    /// The `invitees` list had duplicate items.
    const E_CREATION_INVITEES_HAS_DUPLICATES: u64 = 2;

    /// `per_member_amount_octa` was zero.
    const E_CREATION_PER_MEMBER_AMOUNT_ZERO: u64 = 3;

    /// `check_in_frequency_secs` was out of the accepted range.
    const E_CREATION_CHECK_IN_FREQUENCY_OUT_OF_RANGE: u64 = 4;

    /// `claim_window_secs` was too small. If the tontine is being configured to stake funds to a delegation pool, the claim window needs to be large enough to allow for unlocking the funds.
    const E_CREATION_CLAIM_WINDOW_TOO_SMALL: u64 = 5;

    /// `fallback_policy` was invalid.
    const E_CREATION_INVALID_FALLBACK_POLICY: u64 = 6;

    /// There was no delegation pool at the specified address.
    const E_CREATION_NO_DELEGATION_POOL: u64 = 7;

    /// The required minimum was too small to allow for staking. If staking, each member must contribute at least 20 APT / <number of members>.
    const E_CREATION_MINIMUM_TOO_SMALL: u64 = 8;

    /// Tried to interact with an account with no TontineStore.
    const E_TONTINE_STORE_NOT_FOUND: u64 = 10;

    /// Tried to get a Tontine from a TontineStore but there was nothing found with the requested index.
    const E_TONTINE_NOT_FOUND: u64 = 11;

    /// Tried to perform an action but the given caller is not in the tontine.
    const E_CALLER_NOT_IN_TONTINE: u64 = 12;

    /// Tried to perform an action that relies on the member having contributed a certain amount that they haven't actually contributed.
    const E_INSUFFICIENT_CONTRIBUTION: u64 = 13;

    /// Tried to lock the tontine but the conditions aren't yet met.
    const E_LOCK_CONDITIONS_NOT_MET: u64 = 14;

    /// Tried to perform an action but the given tontine is locked.
    const E_TONTINE_LOCKED: u64 = 15;

    /// Tried to perform an action but the caller was not the creator.
    const E_CALLER_IS_NOT_CREATOR: u64 = 16;

    /// Tried to perform an action that the creator is not allowed to take.
    const E_CALLER_IS_CREATOR: u64 = 17;

    /// Tried to add a member to the tontine but they were already in it.
    const E_MEMBER_ALREADY_IN_TONTINE: u64 = 18;

    /// Tried to remove a member from the tontine but they're not in it.
    const E_MEMBER_NOT_IN_TONTINE: u64 = 19;

    /// The creator tried to remove themselves from the tontine.
    const E_CREATOR_CANNOT_REMOVE_SELF: u64 = 20;

    /// The creator tried to contribute / withdraw zero OCTA.
    const E_AMOUNT_ZERO: u64 = 21;

    /// Someone tried to unlock funds but funds were never staked.
    const E_FUNDS_WERE_NOT_STAKED: u64 = 22;

    /// Tried to unlock staked funds but there was nothing to unlock.
    const E_NO_FUNDS_TO_UNLOCK: u64 = 23;

    /// Tried to withdraw staked funds but there was nothing withdrawable.
    const E_NO_FUNDS_TO_WITHDRAW: u64 = 24;

    /*
    ** Error codes corresponding to the overall status of a tontine. We use these when
    ** the tontine is one of these states and that state is invalid for the intended
    ** operation.
    */

    /// The tontine is in state OVERALL_STATUS_STAGING, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_STAGING: u8 = 64;

    /// The tontine is in state OVERALL_STATUS_CAN_BE_LOCKED, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_CAN_BE_LOCKED: u8 = 66;

    /// The tontine is in state OVERALL_STATUS_LOCKED, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_LOCKED: u8 = 67;

    /// The tontine is in state OVERALL_STATUS_FUNDS_CLAIMABLE, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_FUNDS_CLAIMABLE: u8 = 68;

    /// The tontine is in state OVERALL_STATUS_FUNDS_CLAIMED, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_FUNDS_CLAIMED: u8 = 69;

    /// The tontine is in state OVERALL_STATUS_FUNDS_NEVER_CLAIMED, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_FUNDS_NEVER_CLAIMED: u8 = 70;

    /// The tontine is in state OVERALL_STATUS_FALLBACK_EXECUTED, which is invalid for this operation.
    const E_OVERALL_STATUS_IS_FALLBACK_EXECUTED: u8 = 71;

    /*
    ** Error codes corresponding to the status of a member in a tontine. We use these
    ** when the member is in one of these states and that state is invalid for the
    ** intended operation.
    */

    /// The member is in state MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_MUST_CONTRIBUTE_FUNDS: u8 = 128;

    /// The member is in state MEMBER_STATUS_MUST_RECONFIRM, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_MUST_RECONFIRM: u8 = 129;

    /// The member is in state MEMBER_STATUS_READY, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_READY: u8 = 130;

    /// The member is in state MEMBER_STATUS_STILL_ELIGIBLE, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_STILL_ELIGIBLE: u8 = 131;

    /// The member is in state MEMBER_STATUS_INELIGIBLE, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_INELIGIBLE: u8 = 132;

    /// The member is in state MEMBER_STATUS_CAN_CLAIM_FUNDS, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_CAN_CLAIM_FUNDS: u8 = 133;

    /// The member is in state MEMBER_STATUS_CLAIMED_FUNDS, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_CLAIMED_FUNDS: u8 = 134;

    /// The member is in state MEMBER_STATUS_NEVER_CLAIMED_FUNDS, which is invalid for this operation.
    const E_MEMBER_STATUS_IS_NEVER_CLAIMED_FUNDS: u8 = 135;

    /*
    ** Codes representing the overall status of a tontine.
    */

    /// The tontine has been created and is awaiting contributions.
    const OVERALL_STATUS_STAGING: u8 = 64;

    /// The final contribution has been made so the tontine can now be locked.
    const OVERALL_STATUS_CAN_BE_LOCKED: u8 = 66;

    /// The tontine is locked.
    const OVERALL_STATUS_LOCKED: u8 = 67;

    /// All parties but one have failed to check in within the window, so the
    /// remaining party may claim the funds.
    const OVERALL_STATUS_FUNDS_CLAIMABLE: u8 = 68;

    /// The funds were claimed. This is a terminal state. From this point on the
    /// tontine can be destroyed.
    const OVERALL_STATUS_FUNDS_CLAIMED: u8 = 69;

    /// The final party failed to claim the funds within the claim window, so the
    /// fallback policy can be called.
    const OVERALL_STATUS_FUNDS_NEVER_CLAIMED: u8 = 70;

    /// The fallback policy was invoked. This is a terminal state. From this point on
    /// the tontine can be destroyed.
    const OVERALL_STATUS_FALLBACK_EXECUTED: u8 = 71;

    /*
    ** Codes representing the status of members within a tontine.
    */

    /// The member needs to contribute funds.
    const MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS: u8 = 128;

    /// The member must reconfirm their intent to be in the tontine.
    const MEMBER_STATUS_MUST_RECONFIRM: u8 = 129;

    /// The member has contributed funds and reconfirmed if necessary, they are now
    /// just waiting for the tontine to be locked.
    const MEMBER_STATUS_READY: u8 = 130;

    /// The member has so far checked in every time within the check in window and is
    /// therefore still in the running for the funds.
    const MEMBER_STATUS_STILL_ELIGIBLE: u8 = 131;

    /// The member has failed to check in within the check in window and will therefore
    /// never be able to claim the funds.
    const MEMBER_STATUS_INELIGIBLE: u8 = 132;

    /// The member is the last person standing and can claim the funds.
    const MEMBER_STATUS_CAN_CLAIM_FUNDS: u8 = 133;

    /// The member was the last person standing and claimed the funds.
    const MEMBER_STATUS_CLAIMED_FUNDS: u8 = 134;

    /// The member was the last person standing but failed to claim the funds.
    const MEMBER_STATUS_NEVER_CLAIMED_FUNDS: u8 = 135;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct Tontine has key, store {
        /// The parameters used to configure initial creation of the tontine.
        config: TontineConfig,

        /// The time (unixtime in secs) at which the tontine was created.
        creation_time_secs: u64,

        /// Data corresponding to each member.
        member_data: SimpleMap<address, MemberData>,

        /// The time (unixtime in secs) at which the tontine was locked. This will be
        /// zero until the tontine is locked.
        locked_time_secs: u64,

        /// The time (unixtime in secs) at which the funds in the tontine were claimed.
        /// This will be zero until that happens.
        funds_claimed_secs: u64,

        /// The address of the member that claimed the funds. This will be None until
        /// a member claims the funds, and may be None forever if the last member
        /// standing fails to claim the funds and the tontine moves into fallback mode.
        funds_claimed_by: Option<address>,

        /// True if the fallback policy was executed.
        fallback_executed: bool,

        // Events emitted for various lifecycle events.
        tontine_created_events: EventHandle<TontineCreatedEvent>, // todo: this one might be unnecessary
        member_invited_events: EventHandle<MemberInvitedEvent>,
        member_removed_events: EventHandle<MemberRemovedEvent>,
        member_contributed_events: EventHandle<MemberContributedEvent>,
        member_withdrew_events: EventHandle<MemberWithdrewEvent>,
        member_left_events: EventHandle<MemberLeftEvent>,
        tontine_locked_events: EventHandle<TontineLockedEvent>,
        member_checked_in_events: EventHandle<MemberCheckedInEvent>,
        funds_claimed_events: EventHandle<FundsClaimedEvent>,
        fallback_executed_events: EventHandle<FallbackExecutedEvent>,

        // The signer cap for the resource account that holds the funds of the tontine.
        funds_account_signer_cap: SignerCapability,

        // Lets the creator delete the tontine once it is in a terminal state.
        delete_ref: DeleteRef,
    }

    struct TontineConfig has store, drop {
        /// Vanity description for the tontine, this is only used for display purposes.
        description: string::String,

        /// How much each member must contribute to the tontine.
        per_member_amount_octa: u64,

        /// How often, in seconds, each member must check-in to prove that they're
        /// still in control of their account.
        check_in_frequency_secs: u64,

        /// When there is only one member left standing, this is the additional time
        /// beyond the end of their next check in window in which they may claim the
        /// funds in the tontine.
        claim_window_secs: u64,

        /// What happens if the last-standing member of the tontine fails to claim the
        /// funds within the claim window.
        fallback_policy: TontineFallbackPolicy,

        /// If set, the funds of the tontine will staked in this delegated staking pool
        /// once the tontine is locked.
        delegation_pool: Option<address>,
    }

    struct Testing has store, drop {
        blah: Option<vector<vector<Option<vector<u32>>>>>,
    }

    struct MemberData has store, drop {
        /// How much in OCTA the member has contributed.
        contributed_octa: u64,

        /// Whether this member needs to reconfirm membership in the tontine following
        /// a membership or configuration change.
        reconfirmation_required: bool,

        /// The last time (unixtime in secs) this member of the tontine checked in.
        last_check_in_time_secs: Option<u64>,
    }

    const TONTINE_FALLBACK_POLICY_RETURN_TO_MEMBERS: u8 = 1;

    /// This policy defines what happens if the last-standing member of the tontine
    /// fails to claim the funds within the claim window. The options are:
    /// 1. The funds are returned to the members.
    struct TontineFallbackPolicy has store, drop {
        policy: u8,
    }

    // Note, we don't need to include the address of the object when we create it
    // because the event will be emitted from the object itself.
    struct TontineCreatedEvent has store, drop {
        creator: address,
    }

    struct MemberInvitedEvent has store, drop {
        member: address,
    }

    struct MemberRemovedEvent has store, drop {
        member: address,
    }

    struct MemberContributedEvent has store, drop {
        member: address,
        amount_octa: u64,
    }

    struct MemberWithdrewEvent has store, drop {
        member: address,
        amount_octa: u64,
    }

    struct MemberLeftEvent has store, drop {
        member: address,
        // Will be false if the member left of their own accord, true if the creator of
        // the tontine removed them.
        removed: bool,
    }

    struct TontineLockedEvent has store, drop {}

    struct MemberCheckedInEvent has store, drop {
        member: address,
    }

    struct FundsClaimedEvent has store, drop {
        member: address,
    }

    struct FallbackExecutedEvent has store, drop {}

    /// Create a new tontine.
    public entry fun create(
        caller: &signer,
        description: string::String,
        invitees: vector<address>,
        check_in_frequency_secs: u64,
        claim_window_secs: u64,
        per_member_amount_octa: u64,
        fallback_policy: u8,
        // We take in `address` rather than `Option<address>` because we can't build a
        // payload right now for a function that takes in an option. Instead callers
        // should represent `None` as the zero address.
        delegation_pool: address,
    ) {
        let delegation_pool_option;
        if (delegation_pool == @0x0) {
            delegation_pool_option = option::none();
        } else {
            delegation_pool_option = option::some(delegation_pool);
        };
        create_(caller, description, invitees, check_in_frequency_secs, claim_window_secs, per_member_amount_octa, fallback_policy, delegation_pool_option);
    }

    /// This function is separate from the top level create function so we can use it
    /// tests. This is necessary because entry functions (correctly) cannot return
    /// anything but we need it to return the object with the tontine in it.
    inline fun create_(
        caller: &signer,
        description: string::String,
        invitees: vector<address>,
        check_in_frequency_secs: u64,
        claim_window_secs: u64,
        per_member_amount_octa: u64,
        fallback_policy: u8,
        delegation_pool: Option<address>,
    ): Object<Tontine> {
        // Assert some details about the tontine parameters.
        assert!(!vector::is_empty(&invitees), error::invalid_argument(E_CREATION_INVITEES_EMPTY));
        assert!(check_in_frequency_secs > 30, error::invalid_argument(E_CREATION_CHECK_IN_FREQUENCY_OUT_OF_RANGE));
        assert!(check_in_frequency_secs < 60 * 60 * 24 * 365, error::invalid_argument(E_CREATION_CHECK_IN_FREQUENCY_OUT_OF_RANGE));
        assert!(claim_window_secs > 60 * 60, error::invalid_argument(E_CREATION_CLAIM_WINDOW_TOO_SMALL));
        assert!(claim_window_secs < 60 * 60 * 24 * 365, error::invalid_argument(E_CREATION_CLAIM_WINDOW_TOO_SMALL));
        assert!(per_member_amount_octa > 0, error::invalid_argument(E_CREATION_PER_MEMBER_AMOUNT_ZERO));

        let caller_addr = signer::address_of(caller);

        // Add the creator's address to `invitees` if necessary.
        if (!vector::contains(&invitees, &caller_addr)) {
            vector::push_back(&mut invitees, caller_addr);
        };

        // If the tontine is configured to stake the funds once it is locked, ensure
        // there is a delegation pool at the specified address.
        if (option::is_some(&delegation_pool)) {
            // Assert that the given address actually has a delegation pool.
            assert!(
                delegation_pool::delegation_pool_exists(*option::borrow(&delegation_pool)),
                error::invalid_argument(E_CREATION_NO_DELEGATION_POOL),
            );

            // Since a delegation pool is specified we need to make sure that the claim
            // window is long enough to allow for someone to call unlock on the staked
            // funds and then claim them once they are withdrawable. To that end we
            // ensure that the claim window is at least 2x the lockup duration.
            assert!(
                claim_window_secs >= staking_config::get_recurring_lockup_duration(&staking_config::get()) * 2,
                error::invalid_argument(E_CREATION_CLAIM_WINDOW_TOO_SMALL),
            );

            // Assert that the minimum contribution is high enough such that the total
            // pooled contribution is at least 20 APT (2x MIN_COINS_ON_SHARES_POOL).
            // TODO: Find a way to access this constant though a function from the module.
            assert!(
                per_member_amount_octa * vector::length(&invitees) >= 2000000000,
                error::invalid_argument(E_CREATION_MINIMUM_TOO_SMALL),
            );
        };

        // Build member_data. This will fail if there are duplicates in the invitees
        // list.
        let member_data = simple_map::create();
        while (vector::length(&invitees) > 0) {
            let invitee = vector::pop_back(&mut invitees);
            simple_map::add(
                &mut member_data,
                invitee,
                MemberData {
                    contributed_octa: 0,
                    reconfirmation_required: false,
                    last_check_in_time_secs: option::none(),
                },
            );
        };

        // Create a new object.
        let constructor_ref = &object::create_object_from_account(caller);
        let delete_ref = object::generate_delete_ref(constructor_ref);
        let object_signer = &object::generate_signer(constructor_ref);

        // Emit an event for each invitee except for the creator.
        let member_invited_events = object::new_event_handle(object_signer);
        let len = vector::length(&invitees);
        let i = 0;
        while (i < len) {
            let invitee = vector::borrow(&invitees, i);
            if (invitee != &caller_addr) {
                event::emit_event(&mut member_invited_events, MemberInvitedEvent {
                    member: *invitee,
                });
            };
            i = i + 1;
        };

        assert!(
            fallback_policy == TONTINE_FALLBACK_POLICY_RETURN_TO_MEMBERS,
            error::invalid_argument(E_CREATION_INVALID_FALLBACK_POLICY),
        );

        // Build the TontineConfig. This is mostly a direct copy of the input arguments.
        let tontine_config = TontineConfig {
            description,
            per_member_amount_octa,
            check_in_frequency_secs,
            claim_window_secs,
            fallback_policy: TontineFallbackPolicy {
                policy: fallback_policy,
            },
            delegation_pool,
        };

        // Create a resource account to hold the funds of the tontine.
        let (funds_account_signer, funds_account_signer_cap) = account::create_resource_account(
            object_signer,
            vector::empty(),
        );
        coin::register<AptosCoin>(&funds_account_signer);

        // Create the Tontine.
        let tontine_created_events = object::new_event_handle(object_signer);
        let tontine = Tontine {
            config: tontine_config,
            creation_time_secs: now_seconds(),
            member_data,
            locked_time_secs: 0,
            funds_claimed_secs: 0,
            funds_claimed_by: option::none(),
            fallback_executed: false,
            tontine_created_events,
            member_invited_events,
            member_removed_events: object::new_event_handle(object_signer),
            member_contributed_events: object::new_event_handle(object_signer),
            member_withdrew_events: object::new_event_handle(object_signer),
            member_left_events: object::new_event_handle(object_signer),
            tontine_locked_events: object::new_event_handle(object_signer),
            member_checked_in_events: object::new_event_handle(object_signer),
            funds_claimed_events: object::new_event_handle(object_signer),
            fallback_executed_events: object::new_event_handle(object_signer),
            funds_account_signer_cap,
            delete_ref,
        };

        // Emit an event so the creator of the Tontine and its location can be discovered.
        event::emit_event(&mut tontine.tontine_created_events, TontineCreatedEvent {
            creator: caller_addr,
        });

        // Move the tontine resource into the object.
        move_to(object_signer, tontine);

        object::object_from_constructor_ref(constructor_ref)
    }

    // Invite a new member to a staging tontine.
    public entry fun invite_member(
        caller: &signer,
        tontine: Object<Tontine>,
        member: address,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);
        let creator_addr = object::owner(tontine);

        // Assert the caller is the creator of the tontine.
        assert!(caller_addr == creator_addr, error::invalid_argument(E_CALLER_IS_NOT_CREATOR));

        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert the member isn't already in the tontine.
        assert!(
            !simple_map::contains_key(&tontine_.member_data, &member),
            error::invalid_argument(E_MEMBER_ALREADY_IN_TONTINE),
        );

        // Require reconfirmation from all members of the tontine besides the creator
        // and the person who was just added.
        require_reconfirmation(tontine_, &caller_addr);

        // Add the member to the tontine.
        simple_map::add(
            &mut tontine_.member_data,
            member,
            MemberData {
                contributed_octa: 0,
                reconfirmation_required: false,
                last_check_in_time_secs: option::none(),
            },
        );

        // Emit an event for the member being added.
        event::emit_event(&mut tontine_.member_invited_events, MemberInvitedEvent {
            member,
        });
    }

    // Remove a member from a staging tontine.
    public entry fun remove_member(
        caller: &signer,
        tontine: Object<Tontine>,
        member: address,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);
        let creator_addr = object::owner(tontine);

        // Assert the caller is the creator of the tontine.
        assert!(caller_addr == creator_addr, error::invalid_argument(E_CALLER_IS_NOT_CREATOR));

        // Assert the creator isn't trying to remove themself.
        assert!(caller_addr != member, error::invalid_argument(E_CREATOR_CANNOT_REMOVE_SELF));

        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert the member is in the tontine.
        assert!(simple_map::contains_key(&tontine_.member_data, &member), error::invalid_argument(E_MEMBER_NOT_IN_TONTINE));

        // Return any funds this person might have contributed.
        transfer_all(tontine_, &member, &member);

        // Remove the member from the tontine.
        simple_map::remove(&mut tontine_.member_data, &member);

        // Emit an event for the member being removed.
        event::emit_event(&mut tontine_.member_left_events, MemberLeftEvent {
            member,
            removed: true,
        });

        // Require reconfirmation from all members of the tontine besides the creator
        // and the person who was just added.
        require_reconfirmation(tontine_, &caller_addr);
    }

    /// After a member is added / removed or the configuration is changed, members must
    /// reconfirm their desire to be in the tontine. They must call this function to do
    // so.
    public entry fun reconfirm(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);

        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        let member_data = simple_map::borrow_mut(&mut tontine_.member_data, &caller_addr);
        member_data.reconfirmation_required = false;
    }

    /// Contribute funds to the tontine.
    public entry fun contribute(
        caller: &signer,
        tontine: Object<Tontine>,
        amount_octa: u64,
    ) acquires Tontine {
        assert!(amount_octa > 0, error::invalid_argument(E_AMOUNT_ZERO));

        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert the caller is a member of the tontine.
        let caller_addr = signer::address_of(caller);
        assert_caller_in_tontine(tontine_, &caller_addr);

        // Transfer the funds from the caller's accounts to the resource account
        // containing the tontine funds.
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        coin::transfer<AptosCoin>(caller, resource_acc_addr, amount_octa);

        // Account for the coins contributed.
        let contributor_data = simple_map::borrow_mut(&mut tontine_.member_data, &caller_addr);
        contributor_data.contributed_octa = contributor_data.contributed_octa + amount_octa;

        // Emit an event.
        event::emit_event(&mut tontine_.member_contributed_events, MemberContributedEvent {
            member: caller_addr,
            amount_octa: amount_octa,
        });
    }

    /// Withdraw funds from the tontine.
    public entry fun withdraw(
        caller: &signer,
        tontine: Object<Tontine>,
        amount_octa: u64,
    ) acquires Tontine {
        assert!(amount_octa > 0, error::invalid_argument(E_AMOUNT_ZERO));

        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let caller_addr = signer::address_of(caller);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert the caller is a member of the tontine.
        assert_caller_in_tontine(tontine_, &caller_addr);

        transfer_part(tontine_, &caller_addr, &caller_addr, amount_octa);
    }

    /// Leave a tontine. If the member has any funds in the tontine, this will withdraw
    /// them. The creator cannot leave their own tontine. Instead they must destroy the
    /// tontine, which will return everyone's funds.
    public entry fun leave(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        let caller_addr = signer::address_of(caller);

        // Make sure the caller is not the creator.
        assert!(caller_addr != object::owner(tontine), error::invalid_argument(E_CALLER_IS_CREATOR));

        // Assert the caller is in the tontine.
        assert_caller_in_tontine(tontine_, &caller_addr);

        // Withdraw all funds.
        transfer_all(tontine_, &caller_addr, &caller_addr);

        // Leave the tontine.
        simple_map::remove(&mut tontine_.member_data, &caller_addr);

        // Emit an event.
        event::emit_event(&mut tontine_.member_left_events, MemberLeftEvent {
            member: caller_addr,
            removed: false,
        });
    }

    /// Attempt to lock the tontine.
    public entry fun lock(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        // Assert the tontine is in a valid state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert the caller is a member of the tontine.
        let caller_addr = signer::address_of(caller);
        assert_caller_in_tontine(tontine_, &caller_addr);

        // Set the locked_time_secs to the current time.
        tontine_.locked_time_secs = now_seconds();

        // If configured to do so, stake all the funds.
        if (option::is_some(&tontine_.config.delegation_pool)) {
            let resource_acc_signer = account::create_signer_with_capability(&tontine_.funds_account_signer_cap);
            let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
            let total_balance = coin::balance<AptosCoin>(resource_acc_addr);
            delegation_pool::add_stake(
                &resource_acc_signer,
                *option::borrow(&tontine_.config.delegation_pool),
                total_balance
            );
        };

        // Emit an event.
        event::emit_event(&mut tontine_.tontine_locked_events, TontineLockedEvent {});
    }

    /// Check in, demonstrating that you're still "alive".
    public entry fun check_in(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);

        // Assert the caller is still allowed to check in.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, MEMBER_STATUS_STILL_ELIGIBLE);
        assert_member_status(tontine, allowed, caller_addr);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Update the last check in time for the caller.
        let member_data = simple_map::borrow_mut(&mut tontine_.member_data, &caller_addr);
        option::swap_or_fill(&mut member_data.last_check_in_time_secs, now_seconds());

        // Emit an event.
        event::emit_event(&mut tontine_.member_checked_in_events, MemberCheckedInEvent {
            member: caller_addr,
        });
    }

    /// If someone is now eligible to claim the funds, or the fallback can be executed,
    /// and the tontine was configured to stake the funds upon being locked, this will
    /// request the funds in the delegation pool to be unstaked. After the lockup
    /// period has passed, the funds will be available to be withdrawn by calling claim
    /// or execute_fallback.
    public entry fun unlock(
        tontine: Object<Tontine>,
    ) acquires Tontine {
        // Assert the tontine is in a state where the funds can be unlocked.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_FUNDS_CLAIMABLE);
        vector::push_back(&mut allowed, OVERALL_STATUS_FUNDS_NEVER_CLAIMED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Assert funds were staked in the first place.
        assert!(option::is_some(&tontine_.config.delegation_pool), error::invalid_argument(E_FUNDS_WERE_NOT_STAKED));

        let resource_acc_signer = account::create_signer_with_capability(&tontine_.funds_account_signer_cap);
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        let pool_address = *option::borrow(&tontine_.config.delegation_pool);
        let (stake_active, stake_inactive, _) = delegation_pool::get_stake(pool_address, resource_acc_addr);

        let to_unlock = stake_active + stake_inactive;

        // Assert there is something to unstake.
        assert!(to_unlock > 0, error::invalid_argument(E_NO_FUNDS_TO_UNLOCK));

        delegation_pool::unlock(
            &resource_acc_signer,
            pool_address,
            to_unlock,
        );
    }

    /// Claim the funds of the tontine. This will only work if everyone else has failed
    /// to check in and the the claim window has not passed.
    public entry fun claim(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);

        // Assert the caller is allowed to claim the funds. The underlying member status
        // function will only ever return MEMBER_STATUS_CAN_CLAIM_FUNDS if only a single
        // member remains and they're within the claim window.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, MEMBER_STATUS_CAN_CLAIM_FUNDS);
        assert_member_status(tontine, allowed, caller_addr);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Withdraw stake if funds were staked in the first place. If the funds can't
        // be withdrawn yet this will fail.
        withdraw_stake(tontine_);

        // Transfer all funds in the resource account to the caller.
        let len = simple_map::length(&tontine_.member_data);
        let i = 0;
        while (i < len) {
            let member = *simple_map::key_at_idx(&tontine_.member_data, i);
            transfer_all(tontine_, &member, &caller_addr);
            i = i + 1;
        };

        // Mark the funds as claimed.
        tontine_.funds_claimed_secs = now_seconds();
        tontine_.funds_claimed_by = option::some(caller_addr);

        // Emit an event.
        event::emit_event(&mut tontine_.funds_claimed_events, FundsClaimedEvent {
            member: caller_addr,
        });
    }

    /// Execute the fallback. Anyone can call this function, assuming the tontine is in
    /// a state where the fallback can be executed.
    public entry fun execute_fallback(
        tontine: Object<Tontine>,
    ) acquires Tontine {
        // Assert the tontine is in a state where the fallback can be executed.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_FUNDS_NEVER_CLAIMED);
        assert_overall_status(tontine, allowed);

        let tontine_ = borrow_global_mut<Tontine>(object::object_address(&tontine));

        // Withdraw stake if funds were staked in the first place. If the funds can't
        // be withdrawn yet this will fail.
        withdraw_stake(tontine_);

        if (tontine_.config.fallback_policy.policy == TONTINE_FALLBACK_POLICY_RETURN_TO_MEMBERS) {
            return_funds_to_members(tontine_);
        } else {
            // This should never happen.
            assert!(false, 255);
        };

        tontine_.fallback_executed = true;

        // Emit an event.
        event::emit_event(&mut tontine_.fallback_executed_events, FallbackExecutedEvent {});
    }

    /// Delete the tontine from global storage. This is only possible once the tontine
    /// is in a terminal state.
    public entry fun destroy(
        caller: &signer,
        tontine: Object<Tontine>,
    ) acquires Tontine {
        let caller_addr = signer::address_of(caller);
        let creator_addr = object::owner(tontine);

        // Only the creator can destroy a tontine.
        assert!(caller_addr == creator_addr, error::invalid_state(E_CALLER_IS_NOT_CREATOR));

        // Assert the tontine is in a terminal state.
        let allowed = vector::empty();
        vector::push_back(&mut allowed, OVERALL_STATUS_STAGING);
        vector::push_back(&mut allowed, OVERALL_STATUS_CAN_BE_LOCKED);
        vector::push_back(&mut allowed, OVERALL_STATUS_FUNDS_CLAIMED);
        vector::push_back(&mut allowed, OVERALL_STATUS_FALLBACK_EXECUTED);
        assert_overall_status(tontine, allowed);

        let tontine_ = move_from<Tontine>(object::object_address(&tontine));

        // Return any funds to the members of the tontine. This is only relevant if
        // we're destroying a tontine in the staging state.
        return_funds_to_members(&mut tontine_);

        // Take all the fields out of the Tontine. Immediately drop those that can
        // be dropped.
        let Tontine {
            config: _,
            creation_time_secs: _,
            member_data: _,
            locked_time_secs: _,
            funds_claimed_secs: _,
            funds_claimed_by: _,
            fallback_executed: _,
            tontine_created_events,
            member_invited_events,
            member_removed_events,
            member_contributed_events,
            member_withdrew_events,
            member_left_events,
            tontine_locked_events,
            member_checked_in_events,
            funds_claimed_events,
            fallback_executed_events,
            funds_account_signer_cap: _,
            delete_ref,
        } = tontine_;

        // Delete the event handles.
        event::destroy_handle(tontine_created_events);
        event::destroy_handle(member_invited_events);
        event::destroy_handle(member_removed_events);
        event::destroy_handle(member_contributed_events);
        event::destroy_handle(member_withdrew_events);
        event::destroy_handle(member_left_events);
        event::destroy_handle(tontine_locked_events);
        event::destroy_handle(member_checked_in_events);
        event::destroy_handle(funds_claimed_events);
        event::destroy_handle(fallback_executed_events);

        // How do I destroy the resource account? Or at least the coin store on the account.

        // Destroy the object core.
        object::delete(delete_ref);
    }

    /// Require reconfirmation from all members of the tontine besides the creator.
    inline fun require_reconfirmation(tontine_: &mut Tontine, caller_addr: &address) {
        let len = simple_map::length(&tontine_.member_data);
        let i = 0;
        while (i < len) {
            let member = *simple_map::key_at_idx(&tontine_.member_data, i);
            if (&member != caller_addr) {
                let member_data = simple_map::borrow_mut(&mut tontine_.member_data, &member);
                member_data.reconfirmation_required = true;
            };
            i = i + 1;
        };
    }

    /// Return the contributions from each member to them.
    inline fun return_funds_to_members(tontine_: &mut Tontine) {
        let len = simple_map::length(&tontine_.member_data);
        let i = 0;
        while (i < len) {
            let member = *simple_map::key_at_idx(&tontine_.member_data, i);
            transfer_all(tontine_, &member, &member);
            i = i + 1;
        };
    }

    /// Transfer all funds deposited by depositor to withdrawer.
    inline fun transfer_all(
        tontine_: &mut Tontine,
        depositor: &address,
        withdrawer: &address,
    ) {
        let depositor_data = simple_map::borrow(&tontine_.member_data, depositor);
        transfer_part(tontine_, depositor, withdrawer, depositor_data.contributed_octa);
    }

    /// Transfer some funds deposited by depositor to withdrawer.
    inline fun transfer_part(
        tontine_: &mut Tontine,
        depositor: &address,
        withdrawer: &address,
        amount_octa: u64,
    ) {
        let depositor_data = simple_map::borrow_mut(&mut tontine_.member_data, depositor);

        // Assert that the withdrawer is not trying to withdraw more than the depositor
        // contributed.
        assert!(
            amount_octa <= depositor_data.contributed_octa,
            error::invalid_state(E_INSUFFICIENT_CONTRIBUTION),
        );

        // Transfer funds deposited by the depositor from the tontine to the withdrawer.
        coin::transfer<AptosCoin>(
            &account::create_signer_with_capability(&tontine_.funds_account_signer_cap),
            *withdrawer,
            amount_octa,
        );

        // Emit an event
        event::emit_event(&mut tontine_.member_withdrew_events, MemberWithdrewEvent {
            member: *withdrawer,
            amount_octa: amount_octa,
        });

        // Account for the withdrawal of the funds.
        depositor_data.contributed_octa = depositor_data.contributed_octa - amount_octa;
    }

    /// If the funds were staked, withdraw any funds from the stake pool. If the
    /// funds cannot be withdrawn, unlock hasn't been called yet / was called too
    /// recently, in which case we abort.
    inline fun withdraw_stake(tontine_: &Tontine) {
        if (option::is_some(&tontine_.config.delegation_pool)) {
            let resource_acc_signer = account::create_signer_with_capability(&tontine_.funds_account_signer_cap);
            let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
            let pool_address = *option::borrow(&tontine_.config.delegation_pool);
            let (can_withdraw, to_withdraw) = delegation_pool::get_pending_withdrawal(pool_address, resource_acc_addr);

            // Assert there is something to withdraw.
            assert!(can_withdraw, error::invalid_argument(E_NO_FUNDS_TO_WITHDRAW));

            delegation_pool::withdraw(
                &resource_acc_signer,
                pool_address,
                to_withdraw,
            );
        };
    }

    /// Assert the caller is in the tontine.
    inline fun assert_caller_in_tontine(tontine_: &Tontine, caller_addr: &address) {
        assert!(
            simple_map::contains_key(&tontine_.member_data, caller_addr),
            error::invalid_state(E_CALLER_NOT_IN_TONTINE),
        );
    }

    /// Get the time a member last checked in.
    fun get_last_check_in_time_secs(tontine: &Tontine, member: &address): u64 {
        let member_data = simple_map::borrow(&tontine.member_data, member);
        if (option::is_some(&member_data.last_check_in_time_secs)) {
            *option::borrow(&member_data.last_check_in_time_secs)
        } else {
            // If the member has never explicitly checked in, the implied last check in
            // is the time the tontine was locked.
            tontine.locked_time_secs
        }
    }

    #[view]
    /// Get the statuses of the members of the tontine.
    fun get_member_statuses(tontine: Object<Tontine>): SimpleMap<address, u8> acquires Tontine {
        let statuses: SimpleMap<address, u8> = simple_map::create();

        let now = now_seconds();

        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));

        let funds_claimed = option::is_some(&tontine_.funds_claimed_by);
        let tontine_locked = tontine_.locked_time_secs > 0;

        // Some data we collect as we build the statuses.
        let num_checked_in_frequently_enough = 0;
        let most_recent_check_in_address = simple_map::key_at_idx(&tontine_.member_data, 0);
        let most_recent_check_in_time_secs = 0;

        let i = 0;
        let len = simple_map::length(&tontine_.member_data);
        while (i < len) {
            let member = simple_map::key_at_idx(&tontine_.member_data, i);
            let member_data = simple_map::borrow(&tontine_.member_data, member);

            let status = if (funds_claimed) {
                // The funds were claimed.
                let claimed_by = option::borrow(&tontine_.funds_claimed_by);
                if (member == claimed_by) {
                    // The member claimed the funds.
                    MEMBER_STATUS_CLAIMED_FUNDS
                } else {
                    // Everyone else is ineligible.
                    MEMBER_STATUS_INELIGIBLE
                }
            } else if (tontine_locked) {
                // The tontine is locked. It might even be finished.
                let last_check_in_time_secs = get_last_check_in_time_secs(tontine_, member);
                // Keep track of who checked in most recently.
                if (last_check_in_time_secs > most_recent_check_in_time_secs) {
                    most_recent_check_in_time_secs = last_check_in_time_secs;
                    most_recent_check_in_address = member;
                };
                if (now > last_check_in_time_secs + tontine_.config.check_in_frequency_secs) {
                    // The member failed to check in.
                    MEMBER_STATUS_INELIGIBLE
                } else {
                    // The member has been checking in at the required frequency.
                    num_checked_in_frequently_enough = num_checked_in_frequently_enough + 1;
                    MEMBER_STATUS_STILL_ELIGIBLE
                }
            } else {
                // The tontine is not locked yet.
                if (member_data.contributed_octa < tontine_.config.per_member_amount_octa) {
                    // The member has contributed funds, but not yet enough.
                    MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS
                } else {
                    if (member_data.reconfirmation_required) {
                        // The member has contributed the required funds but we're
                        // waiting for them to reconfirm their membership intent.
                        MEMBER_STATUS_MUST_RECONFIRM
                    } else {
                        // The member has contributed the required funds and has no
                        // reconfirmation obligations.
                        MEMBER_STATUS_READY
                    }
                }
            };

            simple_map::add(&mut statuses, *member, status);
            i = i + 1;
        };

        if (!funds_claimed && tontine_locked) {
            // The tontine is ongoing or entered fallback mode.
            if (num_checked_in_frequently_enough == 1) {
                // Only one person is still eligible so we mark them as being able to
                // claim the funds.
                simple_map::upsert(&mut statuses, *most_recent_check_in_address, MEMBER_STATUS_CAN_CLAIM_FUNDS);
            } else if (num_checked_in_frequently_enough == 0) {
                // No one is able to check in any more. In this case, we look at the
                // person who checked in most recently and if we haven't moved past
                // the claim window, mark them as able to claim the funds.
                if (now < most_recent_check_in_time_secs + tontine_.config.claim_window_secs) {
                    simple_map::upsert(&mut statuses, *most_recent_check_in_address, MEMBER_STATUS_CAN_CLAIM_FUNDS);
                } else {
                    // The claim window has passed, mark the member who could've claimed
                    // the funds as having failed to do so.
                    simple_map::upsert(&mut statuses, *most_recent_check_in_address, MEMBER_STATUS_NEVER_CLAIMED_FUNDS);
                }
            }

        };

        statuses
    }

    #[view]
    /// Get the status of a member of the tontine.
    fun get_member_status(tontine: Object<Tontine>, member: address): u8 acquires Tontine {
        let statuses = get_member_statuses(tontine);
        assert!(simple_map::contains_key(&statuses, &member), error::invalid_state(E_CALLER_NOT_IN_TONTINE));
        let (_, v) = simple_map::remove(&mut statuses, &member);
        v
    }

    #[view]
    /// Get the status of the tontine.
    fun get_overall_status(tontine: Object<Tontine>): u8 acquires Tontine {
        let (_, statuses) = simple_map::to_vec_pair(get_member_statuses(tontine));

        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));

        if (option::is_some(&tontine_.funds_claimed_by)) {
            return OVERALL_STATUS_FUNDS_CLAIMED
        };

        if (tontine_.fallback_executed) {
            return OVERALL_STATUS_FALLBACK_EXECUTED
        };

        // Build up counts of relevant per member statuses.
        let num_members = simple_map::length(&tontine_.member_data);
        let num_ready = 0;

        loop {
            if (vector::is_empty(&statuses)) {
                break
            };
            let status = vector::pop_back(&mut statuses);
            if (status == MEMBER_STATUS_READY) {
                num_ready = num_ready + 1;
            };
            if (status == MEMBER_STATUS_CAN_CLAIM_FUNDS) {
                return OVERALL_STATUS_FUNDS_CLAIMABLE
            };
            if (status == MEMBER_STATUS_NEVER_CLAIMED_FUNDS) {
                return OVERALL_STATUS_FUNDS_NEVER_CLAIMED
            };
        };

        if (tontine_.locked_time_secs == 0) {
            if (num_ready == num_members) {
                return OVERALL_STATUS_CAN_BE_LOCKED
            } else {
                return OVERALL_STATUS_STAGING
            }
        };

        OVERALL_STATUS_LOCKED
    }

    /// Assert that the overall status is in the allowed list. If not, return an error
    /// corresponding to what status it is in.
    inline fun assert_overall_status(tontine: Object<Tontine>, allowed: vector<u8>) acquires Tontine {
        let status = get_overall_status(tontine);

        // This is a bit of a hack based on the fact that the status codes and the
        // error codes we use when the tontine is in that state match.
        assert!(vector::contains(&allowed, &status), error::invalid_state((status as u64)));
    }

    /// Assert that the member status is in the allowed list. If not, return an error
    /// corresponding to what status it is in.
    inline fun assert_member_status(tontine: Object<Tontine>, allowed: vector<u8>, member: address) acquires Tontine {
        let status = get_member_status(tontine, member);

        // This is a bit of a hack based on the fact that the status codes and the
        // error codes we use when the tontine is in that state match.
        assert!(vector::contains(&allowed, &status), error::invalid_state((status as u64)));
    }

    #[view]
    /// Return the active (locked), inactive (withdrawable), pending_inactive
    /// (pending withdrawable) stake. Only one of these numbers should be non-zero.
    /// If pending_inactive > 0, the final value will be the unixtime in seconds
    /// of when the stake will become withdrawable. Otherwise it will be zero.
    fun get_stake_data(tontine: Object<Tontine>): (u64, u64, u64, u64) acquires Tontine {
        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));
        if (option::is_none(&tontine_.config.delegation_pool)) {
            (0, 0, 0, 0)
        } else {
            // We know that the DelegationPool and StakePool will always be at the same
            // address.
            let pool_address = *option::borrow(&tontine_.config.delegation_pool);
            let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
            let (active, inactive, pending_inactive) = delegation_pool::get_stake(pool_address, resource_acc_addr);
            let locked_up_until = if (pending_inactive > 0) {
                stake::get_lockup_secs(pool_address)
            } else {
                0
            };
            (active, inactive, pending_inactive, locked_up_until)
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////
    //                                     Tests                                     //
    ///////////////////////////////////////////////////////////////////////////////////

    #[test_only]
    use std::timestamp;
    #[test_only]
    use aptos_framework::aptos_coin;

    #[test_only]
    const CHECK_IN_FREQUENCY_SECS: u64 = 60 * 60 * 24 * 30;

    #[test_only]
    const CLAIM_WINDOW_SECS: u64 = 60 * 60 * 24 * 60;

    #[test_only]
    const ONE_APT: u64 = 100000000;

    #[test_only]
    const STARTING_BALANCE: u64 = 50 * 100000000;

    #[test_only]
    const REQUIRED_CONTRIBUTION: u64 = 20 * 100000000;

    #[test_only]
    const HALF_REQUIRED_CONTRIBUTION: u64 = 10 * 100000000;

    #[test_only]
    /// Create a test account with some funds.
    fun create_test_account(
        aptos_framework: &signer,
        account: &signer,
    ) {
        if (!aptos_coin::has_mint_capability(aptos_framework)) {
            // If aptos_framework doesn't have the mint cap it means we need to do some
            // initialization. This function will initialize AptosCoin and store the
            // mint cap in aptos_framwork. These capabilities that are returned from the
            // function are just copies. We don't need them since we use aptos_coin::mint
            // to mint coins, which uses the mint cap from the MintCapStore on
            // aptos_framework. So we burn them.
            let (burn_cap, mint_cap) = aptos_coin::initialize_for_test(aptos_framework);
            coin::destroy_burn_cap(burn_cap);
            coin::destroy_mint_cap(mint_cap);
        };
        account::create_account_for_test(signer::address_of(account));
        coin::register<AptosCoin>(account);
        aptos_coin::mint(aptos_framework, signer::address_of(account), STARTING_BALANCE);
    }

    #[test_only]
    public fun set_global_time(
        aptos_framework: &signer,
        timestamp: u64
    ) {
        timestamp::set_time_has_started_for_testing(aptos_framework);
        timestamp::update_global_time_for_test_secs(timestamp);
    }

    #[test_only]
    fun create_tontine(creator: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer): Object<Tontine> {
        set_global_time(aptos_framework, 100);

        create_test_account(aptos_framework, creator);
        create_test_account(aptos_framework, friend1);
        create_test_account(aptos_framework, friend2);

        let friend1_addr = signer::address_of(friend1);
        let friend2_addr = signer::address_of(friend2);

        let invitees = vector::empty();
        vector::push_back(&mut invitees, friend1_addr);
        vector::push_back(&mut invitees, friend2_addr);

        create_(
            creator,
            string::utf8(b"test"),
            invitees,
            CHECK_IN_FREQUENCY_SECS,
            CLAIM_WINDOW_SECS,
            REQUIRED_CONTRIBUTION,
            TONTINE_FALLBACK_POLICY_RETURN_TO_MEMBERS,
            option::none(),
        )
    }

    #[test_only]
    fun create_tontine_with_staking(creator: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer, pool_address: address): Object<Tontine> {
        create_test_account(aptos_framework, creator);
        create_test_account(aptos_framework, friend1);
        create_test_account(aptos_framework, friend2);

        let friend1_addr = signer::address_of(friend1);
        let friend2_addr = signer::address_of(friend2);

        let invitees = vector::empty();
        vector::push_back(&mut invitees, friend1_addr);
        vector::push_back(&mut invitees, friend2_addr);

        create_(
            creator,
            string::utf8(b"test"),
            invitees,
            CHECK_IN_FREQUENCY_SECS,
            CLAIM_WINDOW_SECS,
            REQUIRED_CONTRIBUTION,
            TONTINE_FALLBACK_POLICY_RETURN_TO_MEMBERS,
            option::some(pool_address),
        )
    }

    #[test_only]
    /// Progress a tontine to the point where everyone has contributed.
    fun contribute_to_tontine(creator: &signer, friend1: &signer, friend2: &signer, _aptos_framework: &signer, tontine: Object<Tontine>): Object<Tontine> acquires Tontine {
        let creator_addr = signer::address_of(creator);
        let friend1_addr = signer::address_of(friend1);
        let friend2_addr = signer::address_of(friend2);

        // See that everyone is marked as needing to contribute to begin with.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);

        // See that the overall status is still staging.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_STAGING, 0);

        // Contribute less than the required amount, see that they will still be
        // marked as needing to contribute funds.
        contribute(friend1, tontine, HALF_REQUIRED_CONTRIBUTION);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);

        // Contribute the rest and see that they get marked as ready.
        contribute(friend1, tontine, HALF_REQUIRED_CONTRIBUTION);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_READY, 0);

        // See that the other members still have the same status.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_MUST_CONTRIBUTE_FUNDS, 0);

        // See that the tontine overall status indicates it can be locked once
        // all members contribute.
        contribute(creator, tontine, REQUIRED_CONTRIBUTION);
        contribute(friend2, tontine, REQUIRED_CONTRIBUTION);
        assert!(get_overall_status(tontine) == OVERALL_STATUS_CAN_BE_LOCKED, 0);

        // Confirm that the correct amount of funds are in the tontine.
        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        assert!(coin::balance<AptosCoin>(resource_acc_addr) == REQUIRED_CONTRIBUTION * 3, 0);

        // Confirm that the contribution amounts are correct for all members.
        let creator_addr = signer::address_of(creator);
        let friend1_addr = signer::address_of(friend1);
        let friend2_addr = signer::address_of(friend2);
        assert!(simple_map::borrow(&tontine_.member_data, &creator_addr).contributed_octa == REQUIRED_CONTRIBUTION, 0);
        assert!(simple_map::borrow(&tontine_.member_data, &friend1_addr).contributed_octa == REQUIRED_CONTRIBUTION, 0);
        assert!(simple_map::borrow(&tontine_.member_data, &friend2_addr).contributed_octa == REQUIRED_CONTRIBUTION, 0);

        tontine
    }

    #[test_only]
    /// Progress a tontine to the point where it has been locked.
    fun lock_tontine(creator: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer, tontine: Object<Tontine>): Object<Tontine> acquires Tontine {
        let tontine = contribute_to_tontine(creator, friend1, friend2, aptos_framework, tontine);

        // See that we can lock the tontine now, and anyone in the tontine can do it.
        lock(friend1, tontine);

        // See that the overall status is now locked.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_LOCKED, 0);

        tontine
    }

    #[test_only]
    /// Progress a tontine to the point where it has been locked and now only one member
    /// has checked in frequently enough.
    fun only_one_remains(creator: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer, tontine: Object<Tontine>): Object<Tontine> acquires Tontine {
        let tontine = lock_tontine(creator, friend1, friend2, aptos_framework, tontine);

        let creator_addr = signer::address_of(creator);
        let friend1_addr = signer::address_of(friend1);
        let friend2_addr = signer::address_of(friend2);

        // See that everyone is considered eligible at the start.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);

        // Advance the time to 1 second before the required check in.
        set_global_time(aptos_framework, now_seconds() + CHECK_IN_FREQUENCY_SECS - 1);

        // See that everyone is considered eligible still.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);

        // Have two people check in.
        check_in(creator, tontine);
        check_in(friend1, tontine);

        // Advance the time past the original required check in time.
        set_global_time(aptos_framework, now_seconds() + 2);

        // See that friend2 is no longer eligible but the rest are still eligible.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_STILL_ELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_INELIGIBLE, 0);

        // Advance the time to roughly middle of the check in window.
        set_global_time(aptos_framework, now_seconds() + CHECK_IN_FREQUENCY_SECS / 2);

        // Have only friend1 check in.
        check_in(friend1, tontine);

        // Advance the time to after the end of this check in window.
        set_global_time(aptos_framework, now_seconds() + CHECK_IN_FREQUENCY_SECS / 2 + 1);

        // See that only friend1 is still eligible.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &creator_addr) == MEMBER_STATUS_INELIGIBLE, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_CAN_CLAIM_FUNDS, 0);
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend2_addr) == MEMBER_STATUS_INELIGIBLE, 0);

        // See that the overall status reflects that friend1 can claim the funds.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_FUNDS_CLAIMABLE, 0);

        tontine
    }

    #[test_only]
    /// Progress a tontine to the point where one person was eligible to claim the funds
    /// failed to do so within the claim window.
    fun no_one_remains(creator: &signer, friend1: &signer, friend2: &signer, aptos_framework: &signer, tontine: Object<Tontine>): Object<Tontine> acquires Tontine {
        let tontine = only_one_remains(creator, friend1, friend2, aptos_framework, tontine);

        // Advance time way in the future.
        set_global_time(aptos_framework, 100000000000);

        let friend1_addr = signer::address_of(friend1);

        // See that friend1 can no longer claim the funds.
        assert!(*simple_map::borrow(&get_member_statuses(tontine), &friend1_addr) == MEMBER_STATUS_NEVER_CLAIMED_FUNDS, 0);
        assert!(get_overall_status(tontine) == OVERALL_STATUS_FUNDS_NEVER_CLAIMED, 0);

        tontine
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_create(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) {
        create_tontine(&creator, &friend1, &friend2, &aptos_framework);
    }

    // TODO: Confirm that these failure codes are what we expect.
    // https://github.com/aptos-labs/aptos-core/issues/8182

    #[expected_failure(abort_code = 65553, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_creator_cannot_leave(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);

        // Confirm that the creator cannot leave their own tontine.
        leave(&creator, tontine);
    }

    // Confirm that when a member leaves they get their funds back.
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_funds_returned_after_leaving(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);

        let friend1_addr = signer::address_of(&friend1);

        let before = coin::balance<AptosCoin>(friend1_addr);

        contribute(&friend1, tontine, STARTING_BALANCE);

        leave(&friend1, tontine);

        let after = coin::balance<AptosCoin>(friend1_addr);

        assert!(before == after, 0);
    }

    // Confirm that when a member is removed they get their funds back.
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_funds_returned_after_being_removed(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);

        let friend1_addr = signer::address_of(&friend1);

        let before = coin::balance<AptosCoin>(friend1_addr);

        contribute(&friend1, tontine, STARTING_BALANCE);

        remove_member(&creator, tontine, friend1_addr);

        let after = coin::balance<AptosCoin>(friend1_addr);

        assert!(before == after, 0);
    }

    #[expected_failure(abort_code = 65552, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_only_creator_can_invite_members(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);

        // Try to add someone to the tontine as someone other than the creator. This
        // should fail.
        invite_member(&friend1, tontine, @0x987654321);
    }

    #[expected_failure(abort_code = 65552, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_only_creator_can_remove_members(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);

        // Try to add someone to the tontine as someone other than the creator. This
        // should fail.
        let friend2_addr = signer::address_of(&friend2);
        remove_member(&friend1, tontine, friend2_addr);
    }

    // Assert the creator can add back a member they removed.
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_add_remove_member(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        let friend2_addr = signer::address_of(&friend2);
        remove_member(&creator, tontine, friend2_addr);
        invite_member(&creator, tontine, friend2_addr);
    }

    #[expected_failure(abort_code = 65556, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_creator_cannot_remove_self(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        let creator_addr = signer::address_of(&creator);
        remove_member(&creator, tontine, creator_addr);
    }

    #[expected_failure(abort_code = 65555, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_remove_member_not_in_tontine(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        remove_member(&creator, tontine, @0x987654321);
    }

    #[expected_failure(abort_code = 65554, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_invite_member_twice(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        let friend2_addr = signer::address_of(&friend2);
        invite_member(&creator, tontine, friend2_addr);
    }

    #[expected_failure(abort_code = 196672, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_lock_until_all_contributed(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        lock(&friend1, tontine);
    }

    #[expected_failure(abort_code = 196672, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_lock_after_invite_member(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = contribute_to_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Add a new member to the tontine.
        invite_member(&creator, tontine, @0x987654321);

        // Confirm that the tontine is no longer reported as lockable.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_STAGING, 0);

        // Try to lock the tontine. This should fail.
        lock(&friend1, tontine)
    }

    #[expected_failure(abort_code = 196672, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_lock_after_remove_member(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = contribute_to_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Remove a member from the tontine.
        let friend1_addr = signer::address_of(&friend1);
        remove_member(&creator, tontine, friend1_addr);

        // Confirm that the tontine is no longer reported as lockable.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_STAGING, 0);

        // Try to lock the tontine. This should fail.
        lock(&friend2, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_can_lock_after_reconfirmation(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = contribute_to_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Remove a member from the tontine.
        let friend1_addr = signer::address_of(&friend1);
        remove_member(&creator, tontine, friend1_addr);

        // Have the remaining members who need to reconfirm do so.
        reconfirm(&friend2, tontine);

        // Confirm that the tontine is reported as lockable.
        assert!(get_overall_status(tontine) == OVERALL_STATUS_CAN_BE_LOCKED, 0);

        // Lock the tontine.
        lock(&friend2, tontine);
    }

    // Confirm that a member who was removed cannot lock the tontine even after
    // reconfirmation fully occurred.
    #[expected_failure(abort_code = 196620, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_lock_if_removed_after_reconfirmation(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = contribute_to_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Remove new member from the tontine.
        let friend1_addr = signer::address_of(&friend1);
        remove_member(&creator, tontine, friend1_addr);

        // Have the other members reconfirm.
        reconfirm(&friend2, tontine);

        // As friend1, who was removed, try to lock the tontine. This should fail.
        lock(&friend1, tontine);
    }

    #[expected_failure(abort_code = 196620, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_contribute_after_leaving(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = contribute_to_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        leave(&friend1, tontine);

        // This should fail.
        contribute(&friend1, tontine, 100);
    }

    #[expected_failure(abort_code = 196675, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_contribute_after_lock(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = lock_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
        contribute(&friend1, tontine, 1);
    }

    #[expected_failure(abort_code = 196675, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_withdraw_after_lock(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = lock_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
        withdraw(&friend1, tontine, 1);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_check_in(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
    }

    #[expected_failure(abort_code = 196740, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_check_in_if_too_late(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        // In create_tontine_only_one_remains, everyone but friend1 failed to check in in time.
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Confirm that creator can no longer check in.
        check_in(&creator, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_claim(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        // In create_tontine_only_one_remains, everyone but friend1 failed to check in in time.
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // Confirm that friend1 can claim the funds.
        claim(&friend1, tontine);

        // Confirm that no funds remain in the tontine.
        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        assert!(coin::balance<AptosCoin>(resource_acc_addr) == 0, 0);

        // Confirm that the contribution amounts are zero for all members.
        let creator_addr = signer::address_of(&creator);
        let friend1_addr = signer::address_of(&friend1);
        let friend2_addr = signer::address_of(&friend2);
        assert!(simple_map::borrow(&tontine_.member_data, &creator_addr).contributed_octa == 0, 0);
        assert!(simple_map::borrow(&tontine_.member_data, &friend1_addr).contributed_octa == 0, 0);
        assert!(simple_map::borrow(&tontine_.member_data, &friend2_addr).contributed_octa == 0, 0);
    }

    #[expected_failure(abort_code = 196740, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_others_cannot_claim(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        // In create_tontine_only_one_remains, everyone but friend1 failed to check in in time.
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // This should fail, friend2 is not eligible claim the funds.
        claim(&friend2, tontine);
    }

    // Advance time beyond the end of the check in window and see that the last standing
    // member can still claim the funds if we're within the claim window.
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_claim_within_window(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        // In create_tontine_only_one_remains, everyone but friend1 failed to check in in time.
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // This is when friend1 last checked in.
        let last_check_in_time = now_seconds() - (CHECK_IN_FREQUENCY_SECS / 2 + 1);

        set_global_time(&aptos_framework, last_check_in_time + CLAIM_WINDOW_SECS - 1);

        claim(&friend1, tontine);
    }

    #[expected_failure(abort_code = 196743, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_claim_outside_of_claim_window(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        // This is when friend1 last checked in.
        let last_check_in_time = now_seconds() - (CHECK_IN_FREQUENCY_SECS / 2 + 1);

        set_global_time(&aptos_framework, last_check_in_time + CLAIM_WINDOW_SECS + 1);

        claim(&friend1, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_execute_fallback(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = no_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );

        execute_fallback(tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_destroy_staging(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        destroy(&creator, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_destroy_staging_contributed(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = create_tontine(&creator, &friend1, &friend2, &aptos_framework);
        contribute(&friend1, tontine, STARTING_BALANCE);
        destroy(&creator, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_destroy_claimed(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
        claim(&friend1, tontine);
        destroy(&creator, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_destroy_fallback_executed(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = no_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
        execute_fallback(tontine);
        destroy(&creator, tontine);
    }

    #[expected_failure(abort_code = 196675, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, aptos_framework = @aptos_framework)]
    fun test_cannot_destroy_locked(creator: signer, friend1: signer, friend2: signer, aptos_framework: signer) acquires Tontine {
        let tontine = lock_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine(&creator, &friend1, &friend2, &aptos_framework),
        );
        destroy(&creator, tontine);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // Test tontine staking logic.
    ///////////////////////////////////////////////////////////////////////////////////

    #[test_only]
    /// Initializes a delegation pool and returns its address.
    fun initialize_delegation_pool(
        aptos_framework: &signer,
        validator: &signer,
    ): address {
        delegation_pool::initialize_for_test(aptos_framework);
        delegation_pool::initialize_test_validator(validator, 200 * ONE_APT, true, true);
        delegation_pool::end_aptos_epoch();
        delegation_pool::get_owned_pool_address(signer::address_of(validator))
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_create(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_lock(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) acquires Tontine {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        let tontine = lock_tontine(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address),
        );

        // Assert that no funds remain in the resource account now.
        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        assert!(coin::balance<AptosCoin>(resource_acc_addr) == 0, 0);
    }

    #[expected_failure(abort_code = 65560, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_cannot_immediately_withdraw(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) acquires Tontine {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address),
        );

        // Assert that no funds remain in the resource account still.
        let tontine_ = borrow_global<Tontine>(object::object_address(&tontine));
        let resource_acc_addr = account::get_signer_capability_address(&tontine_.funds_account_signer_cap);
        assert!(coin::balance<AptosCoin>(resource_acc_addr) == 0, 0);

        // See that claiming funds will fail because the funds staked are still locked
        // up. We needed to call unlock first.
        claim(&friend1, tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_claim_after_unlock(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) acquires Tontine {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        let tontine = only_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address),
        );

        // Unlock funds.
        unlock(tontine);

        // I can't quite figure out how to properly simulate time advancing and
        // updating the pool stake as appropriate. So we just call this test function
        // that ends the epoch.
        delegation_pool::end_aptos_epoch();

        // See that claiming funds will fail because the funds staked are still locked
        // up. We needed to call unlock first.
        claim(&friend1, tontine);
    }

    #[expected_failure(abort_code = 65560, location = Self)]
    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_cannot_immediately_execute_fallback(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) acquires Tontine {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        let tontine = no_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address),
        );

        // See that claiming funds will fail because the funds staked are still locked
        // up. We needed to call unlock first.
        execute_fallback(tontine);
    }

    #[test(creator = @0x123, friend1 = @0x456, friend2 = @0x789, validator = @0x777, aptos_framework = @aptos_framework)]
    fun test_staking_execute_fallback_after_unlock(creator: signer, friend1: signer, friend2: signer, validator: signer, aptos_framework: signer) acquires Tontine {
        let pool_address = initialize_delegation_pool(&aptos_framework, &validator);
        let tontine = no_one_remains(
            &creator,
            &friend1,
            &friend2,
            &aptos_framework,
            create_tontine_with_staking(&creator, &friend1, &friend2, &aptos_framework, pool_address),
        );

        // Unlock funds.
        unlock(tontine);

        delegation_pool::end_aptos_epoch();

        // See that claiming funds will fail because the funds staked are still locked
        // up. We needed to call unlock first.
        execute_fallback(tontine);
    }
}

