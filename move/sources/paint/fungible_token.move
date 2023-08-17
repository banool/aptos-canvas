// Copyright (c) Aptos Labs
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.

module addr::paint_fungible_token {
    use std::string;
    use std::option;
    use aptos_token_objects::token::create_named_token;
    use aptos_token_objects::collection::create_fixed_collection;
    use addr::paint_fungible_asset::{get_name, initialize};

    const ASSET_SYMBOL: vector<u8> = b"PNT";

    /// One-time initialization. TODO: Explain why I use this rather than init_module.
    fun init_module(publisher: &signer) {
        let name = get_name();

        // Create the collection that the fungible token will be part of.
        create_fixed_collection(
            publisher,
            string::utf8(b"Paint Tin"),
            1,
            name,
            option::none(),
            string::utf8(b"http://todo.com/todo"),
        );

        // Create the token part of the fungible token.
        let constructor_ref = &create_named_token(
            publisher,
            name,
            string::utf8(b"Paint token description"),
            name, /* token name */
            option::none(),
            string::utf8(b"http://todo.com/todo"),
        );

        // Initialize the refs for the fungible asset.
        initialize(
            constructor_ref,
            name, /* name */
            string::utf8(ASSET_SYMBOL), /* symbol */
            string::utf8(b"http://todo.com/todo.ico"), /* icon */
            string::utf8(b"http://todo.com"), /* project */
        );
    }

    #[test(creator = @addr)]
    public fun test_init(creator: &signer) {
        init_module(creator);
    }

    #[test_only]
    use addr::paint_fungible_asset::mint;
    #[test_only]
    use std::signer;

    #[test(caller = @addr, aaron = @0xface)]
    #[expected_failure(abort_code = 0x50001, location = addr::paint_fungible_asset)]
    fun test_mint_denied(
        caller: &signer,
        aaron: &signer
    ) {
        init_module(caller);
        let caller_address = signer::address_of(caller);
        mint(aaron, caller_address, 100);
    }

    #[test(caller = @addr, aaron = @0xface)]
    fun test_mint_allowed(
        caller: &signer,
        aaron: &signer
    ) {
        init_module(caller);
        let aaron_address = signer::address_of(aaron);
        mint(caller, aaron_address, 100);
    }
}
