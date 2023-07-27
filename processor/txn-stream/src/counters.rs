// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

use once_cell::sync::Lazy;
use prometheus::{register_int_counter_vec, IntCounterVec};

/// Count of bytes received.
pub static RECEIVED_BYTES_COUNT: Lazy<IntCounterVec> = Lazy::new(|| {
    register_int_counter_vec!(
        "indexer_processor_received_bytes_count",
        "Count of bytes received from the txn stream service",
        &["processor_name"]
    )
    .unwrap()
});
