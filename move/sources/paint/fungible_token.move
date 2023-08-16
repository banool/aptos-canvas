// Copyright (c) Aptos Labs
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.

module addr::paint_fungible_token {
    use aptos_framework::fungible_asset::Metadata;
    use aptos_framework::object::{Self, Object};
    use std::string::utf8;
    use std::option;
    use aptos_token_objects::token::{create_named_token, create_token_seed};
    use aptos_token_objects::collection::create_fixed_collection;
    use addr::paint_fungible_asset;

    const ASSET_SYMBOL: vector<u8> = b"PNT";

    const NAME: vector<u8> = b"Paint";

    /// The account that is allowed to create . For now we just enforce
    /// that the collection creator is the same account that published the module.
    const PERMITTED_COLLECTION_CREATOR: address = @addr;

    /// One-time initialization. TODO: Explain why I use this rather than init_module.
    fun init_module(publisher: &signer) {
        let name = utf8(NAME);

        // Create the collection that the fungible token will be part of.
        create_fixed_collection(
            publisher,
            utf8(b"test collection description"),
            1,
            name,
            option::none(),
            utf8(b"http://todo.com/todo"),
        );

        // Create the token part of the fungible token.
        let constructor_ref = &create_named_token(
            publisher,
            name,
            utf8(b"Paint token description"),
            name, /* token name */
            option::none(),
            utf8(b"http://todo.com/todo"),
        );

        // Initialize the refs for the fungible asset.
        paint_fungible_asset::initialize(
            constructor_ref,
            name, /* name */
            utf8(ASSET_SYMBOL), /* symbol */
            utf8(b"http://todo.com/todo.ico"), /* icon */
            utf8(b"http://todo.com"), /* project */
        );
    }

    #[view]
    /// Return the address of the managed fungible asset that's created when this module is deployed.
    /// This function is optional as a helper function for offline applications.
    public fun get_metadata(): Object<Metadata> {
        let name = utf8(NAME);
        let asset_address = object::create_object_address(
            &@addr,
            create_token_seed(&name, &name)
        );
        object::address_to_object<Metadata>(asset_address)
    }

    #[test(creator = @addr)]
    fun test_init(creator: &signer) {
        init_module(creator);
    }
}
