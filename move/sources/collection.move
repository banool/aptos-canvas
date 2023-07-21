// Copyright (c) Daniel Porteous
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.

/// A note on the set_* functions:
/// This module allows the owner of the collection to transfer ownership to another
/// account. As such, in order to determine the current owner of the collection, we
/// must use the collection creator and collection name to determine its address and
/// then check the owner that way, rather than just assume the creator is the owner.

module addr::canvas_collection {
    use std::error;
    use std::option;
    use std::signer;
    use std::string::{Self, String};
    use aptos_std::object::{Self, Object, TransferRef};
    use aptos_token_objects::collection::{Self, Collection, MutatorRef};

    /// The account trying to create the collection is not allowed to do so.
    const E_COLLECTION_CREATOR_FORBIDDEN: u64 = 1;

    /// The account trying to mutate the collection is not allowed to do so.
    const E_COLLECTION_MUTATOR_FORBIDDEN: u64 = 2;

    /// The account trying to transfer ownership of the collection is not allowed to do so.
    const E_COLLECTION_TRANSFERER_FORBIDDEN: u64 = 3;

    /// The account that is allowed to create the collection. For now we just enforce
    /// that the collection creator is the same account that published the module.
    const PERMITTED_COLLECTION_CREATOR: address = @addr;

    /// The name of the collection.
    const COLLECTION_NAME: vector<u8> = b"Aptos Canvas // Phase 1";

    /// Resource we store at the object address to enable mutation and transfer of the
    /// collection.
    struct CollectionRefs has key {
        transfer_ref: TransferRef,
        mutator_ref: MutatorRef,
    }

    /// One-time initialization in which we create the collection. I choose to use an
    /// explicit create_collection function rather than init_module because maybe I'll
    /// want to create more collections down the line, so this way it will be more
    /// uniform. This is the only time we use PERMITTED_COLLECTION_CREATOR,; once the
    /// collection is made, we use the collection owner instead.
    public entry fun create(caller: &signer) {
        assert!(
            signer::address_of(caller) == PERMITTED_COLLECTION_CREATOR,
            error::invalid_argument(E_COLLECTION_CREATOR_FORBIDDEN),
        );
        let constructor_ref = collection::create_unlimited_collection(
            caller,
            string::utf8(b"unset"),
            get_collection_name(),
            option::none(),
            string::utf8(b"unset"),
        );
        let transfer_ref = object::generate_transfer_ref(&constructor_ref);
        let mutator_ref = collection::generate_mutator_ref(&constructor_ref);
        let collection_refs = CollectionRefs {
            transfer_ref,
            mutator_ref,
        };
        let object_signer = object::generate_signer(&constructor_ref);
        move_to(&object_signer, collection_refs);
    }

    /// Set the URI of the collection.
    public entry fun set_uri(caller: &signer, uri: String) acquires CollectionRefs {
        let collection = get_collection();
        assert!(
            object::is_owner<Collection>(collection, signer::address_of(caller)),
            error::invalid_argument(E_COLLECTION_MUTATOR_FORBIDDEN),
        );
        let collection_refs = borrow_global<CollectionRefs>(object::object_address(&collection));
        collection::set_uri(&collection_refs.mutator_ref, uri);
    }

    /// Set the description of the collection.
    public entry fun set_description(caller: &signer, description: String) acquires CollectionRefs {
        let collection = get_collection();
        assert!(
            object::is_owner<Collection>(collection, signer::address_of(caller)),
            error::invalid_argument(E_COLLECTION_MUTATOR_FORBIDDEN),
        );
        let collection_refs = borrow_global<CollectionRefs>(object::object_address(&collection));
        collection::set_description(&collection_refs.mutator_ref, description);
    }

    /// Transfer ownership of the collection.
    public entry fun transfer(caller: &signer, collection: Object<Collection>, to: address) acquires CollectionRefs {
        assert!(
            object::is_owner<Collection>(collection, signer::address_of(caller)),
            error::invalid_argument(E_COLLECTION_TRANSFERER_FORBIDDEN),
        );
        let collection_refs = borrow_global<CollectionRefs>(object::object_address(&collection));
        let linear_transfer_ref = object::generate_linear_transfer_ref(&collection_refs.transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, to);
    }

    /// Get the collection. Note, if the module is republished with a different
    /// address for the permitted collection creator after the collection has been
    /// created, this will cease to work. Same thing if the collection name is changed.
    public fun get_collection(): Object<Collection> {
        let collection_address = collection::create_collection_address(
            &PERMITTED_COLLECTION_CREATOR,
            &string::utf8(COLLECTION_NAME),
        );
        object::address_to_object<Collection>(collection_address)
    }

    public fun get_collection_name(): String {
        string::utf8(COLLECTION_NAME)
    }
}
