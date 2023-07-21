// Copyright (c) Daniel Porteous
// SPDX-License-Identifier: Apache-2.0

//! See the README for more information about how this module works.

module addr::canvas_collection_01 {
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

    /// Resource we store at the object address to enable mutation and transfer of the
    /// collection. Note that the only mutation we allow is the URI.
    struct CollectionRefs has key {
        transfer_ref: TransferRef,
        mutator_ref: MutatorRef,
    }

    /// One-time initialization in which we create the collection. For now we enforce
    /// that this is called by the account that published the module. I choose this
    /// approach rather than init_module since maybe I'll want to create more
    /// collections down the line, so this way it is more uniform. This is the only
    /// time we use this address for a permission check; once the collection is made,
    /// we use the collection owner instead.
    public entry fun initialize_collection(caller: &signer) {
        assert!(
            signer::address_of(caller) == @addr,
            error::invalid_argument(E_COLLECTION_CREATOR_FORBIDDEN),
        );
        let constructor_ref = collection::create_unlimited_collection(
            caller,
            string::utf8(b"todo"),
            string::utf8(b"Aptos Canvas // Phase 1"),
            option::none(),
            string::utf8(b"todo"),
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
    ///
    /// Because ownership of the collection can be transferred, we can't just assume
    /// the caller of the function is the creator and get their address and derive the
    /// address of the collection that way. Instead, the caller must know the address
    /// of the collection in advance.
    public entry fun set_uri(caller: &signer, collection: Object<Collection>, uri: String) acquires CollectionRefs {
        assert!(
            object::is_owner<Collection>(collection, signer::address_of(caller)),
            error::invalid_argument(E_COLLECTION_MUTATOR_FORBIDDEN),
        );
        let collection_refs = borrow_global<CollectionRefs>(object::object_address(&collection));
        collection::set_uri(&collection_refs.mutator_ref, uri);
    }

    /// Transfer ownership of the collection.
    public entry fun transfer(caller: &signer, collection: Object<Collection>, to: address) acquires CollectionRefs {
        assert!(
            object::is_owner<Collection>(collection, signer::address_of(caller)),
            error::invalid_argument(E_COLLECTION_MUTATOR_FORBIDDEN),
        );
        let collection_refs = borrow_global<CollectionRefs>(object::object_address(&collection));
        let linear_transfer_ref = object::generate_linear_transfer_ref(&collection_refs.transfer_ref);
        object::transfer_with_ref(linear_transfer_ref, to);
    }
}

