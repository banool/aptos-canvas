// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

#[cfg(feature = "counters")]
mod counters;
mod grpc;

use aptos_indexer_protos::transaction::v1::Transaction;
use thiserror::Error;
use tokio::sync::mpsc::Receiver;
use tokio::task::JoinHandle;

#[derive(Error, Debug)]
pub enum StartStreamError {
    #[error("Invalid configuration: {0}")]
    InvalidConfiguration(String),

    #[error("Failed to connect: {0}")]
    FailedToConnect(String),

    #[error("Unknown error: {0}")]
    Unknown(String),
}

pub struct StreamHandle {
    pub join_handle: JoinHandle<()>,
    pub receiver: Receiver<(u64, Vec<Transaction>)>,
}

#[async_trait::async_trait]
pub trait StreamBuilder: 'static + Send + Sync {
    async fn start(
        &self,
        starting_version_from_db: Option<u64>,
    ) -> Result<StreamHandle, StartStreamError>;
}
