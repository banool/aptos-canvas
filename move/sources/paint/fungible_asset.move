// Copyright (c) Aptos Labs
// SPDX-License-Identifier: Apache-2.0

/// This module provides a managed fungible asset that allows the creator of the
/// metadata object to mint and burn fungible assets.
///
/// The functionalities offered by this module are:
/// 1. Mint fungible assets to fungible stores as the owner of metadata object.
/// 2. Burn fungible assets from fungible stores as the owner of the metadata object.
module addr::paint_fungible_asset {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::fungible_asset::{Self, MintRef, BurnRef, Metadata};
    use aptos_framework::object::{Self, Object, ConstructorRef};
    use aptos_framework::primary_fungible_store;
    use aptos_token_objects::token::create_token_seed;

    friend addr::canvas_token;

    /// Name used for the fungible asset, token, and collection.
    const NAME: vector<u8> = b"Paint";

    /// Only the fungible asset metadata caller can access the refs.
    const ERR_NOT_OWNER: u64 = 1;

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Holds refs to control the minting and burning of fungible assets.
    struct FungibleAssetRefs has key {
        mint_ref: MintRef,
        burn_ref: BurnRef,
    }

    /// Initialize metadata object and store the refs we create. Since we control the
    /// mint ref we use an unlimited supply. The constructor_ref we accept here should
    /// come from creating a token.
    public fun initialize(
        constructor_ref: &ConstructorRef,
        name: String,
        symbol: String,
        icon_uri: String,
        project_uri: String,
    ) {
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(), /* supply */
            name,
            symbol,
            // We use two decimal places to give us enough "space" to handle the
            // multiplication factor involved with the cost of drawing a pixel.
            // On the UI we will just hide the decimal places. So really this means
            // drawing a pixel doesn't really cost 1 PNT, it costs 100 PNT.
            2,
            icon_uri,
            project_uri,
        );

        // Create the mint and burn refs.
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let object_singer = object::generate_signer(constructor_ref);
        move_to(
            &object_singer,
            FungibleAssetRefs { mint_ref, burn_ref }
        )
    }

    /// Mint PNT to an account.
    public entry fun mint(
        caller: &signer,
        recipient: address,
        amount: u64,
    ) acquires FungibleAssetRefs {
        let mint_ref = authorized_borrow_mint_ref(caller);
        let metadata = get_metadata();
        let store = primary_fungible_store::ensure_primary_store_exists(recipient, metadata);
        fungible_asset::mint_to(mint_ref, store, amount);
    }

    /// Burn PNT from an account.
    public(friend) fun burn(
        // Account we want to burn from.
        burn_from: address,
        // Amount to burn.
        amount: u64,
    ) acquires FungibleAssetRefs {
        let metadata = get_metadata();
        let refs = borrow_global<FungibleAssetRefs>(object::object_address(&metadata));
        fungible_asset::burn_from(
            &refs.burn_ref,
            primary_fungible_store::primary_store(burn_from, metadata),
            amount,
        );
    }

    /// Borrow the immutable reference of the refs of `metadata`. This validates that
    /// the signer is the metadata object's caller. Use this for entry functions where
    /// we need to validate the caller.
    inline fun authorized_borrow_refs(caller: &signer): &FungibleAssetRefs acquires FungibleAssetRefs {
        let metadata = get_metadata();
        // assert!(1 == 2, error::permission_denied(ERR_NOT_OWNER));
        assert!(
            object::is_owner(metadata, signer::address_of(caller)),
            error::permission_denied(ERR_NOT_OWNER),
        );
        borrow_global<FungibleAssetRefs>(object::object_address(&metadata))
    }

    /// Borrow `MintRef`.
    inline fun authorized_borrow_mint_ref(caller: &signer): &MintRef acquires FungibleAssetRefs {
        let refs = authorized_borrow_refs(caller);
        &refs.mint_ref
    }

    /// Borrow `BurnRef`.
    inline fun authorized_borrow_burn_ref(caller: &signer): &BurnRef acquires FungibleAssetRefs {
        let refs = authorized_borrow_refs(caller);
        &refs.burn_ref
    }

    #[view]
    /// Return the address of the managed fungible asset that's created when this
    /// module is deployed. This function is optional as a helper function for offline
    /// applications.
    public fun get_metadata(): Object<Metadata> {
        let name = get_name();
        let asset_address = object::create_object_address(
            &@addr,
            create_token_seed(&name, &name)
        );
        object::address_to_object<Metadata>(asset_address)
    }

    public fun get_name(): String {
        string::utf8(NAME)
    }
}
