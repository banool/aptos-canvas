// Copyright © Aptos Foundation
// SPDX-License-Identifier: Apache-2.0

#[cfg(feature = "counters")]
use crate::counters::TRANSMITTED_BYTES_COUNT;
use crate::{StartStreamError, StreamBuilder, StreamHandle};
use aptos_indexer_protos::{
    indexer::v1::{raw_data_client::RawDataClient, GetTransactionsRequest},
    transaction::v1::Transaction,
};
use duration_str::deserialize_duration;
use futures::StreamExt;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Duration;
use tracing::{error, info};

/// GRPC request metadata key for the token ID.
const GRPC_AUTH_TOKEN_HEADER: &str = "x-aptos-data-authorization";

/// GRPC request metadata key for the request name. This is used to identify the
/// data destination.
const GRPC_REQUEST_NAME_HEADER: &str = "x-aptos-request-name";

// this is how large the fetch queue should be. Each bucket should have a max of 80MB or so, so a batch
// of 50 means that we could potentially have at least 4.8GB of data in memory at any given time and that we should provision
// machines accordingly.
const BUFFER_SIZE: usize = 50;

const MAX_RESPONSE_SIZE: usize = 1024 * 1024 * 20; // 20MB

#[derive(Debug, Deserialize, Serialize)]
pub struct GrpcStreamBuilder {
    /// todo
    pub processor_name: String,

    /// todo
    pub indexer_grpc_data_service_address: String,

    /// todo
    #[serde(
        deserialize_with = "deserialize_duration",
        default = "GrpcStreamBuilder::default_indexer_grpc_http2_ping_interval"
    )]
    pub indexer_grpc_http2_ping_interval: Duration,

    /// todo
    #[serde(
        deserialize_with = "deserialize_duration",
        default = "GrpcStreamBuilder::default_indexer_grpc_http2_ping_timeout"
    )]
    pub indexer_grpc_http2_ping_timeout: Duration,

    /// The token to use for authentication with the txn stream service GRPC endpoint.
    pub auth_token: String,

    /// If there is no minimum version in the DB, this is the version from which we'll
    /// start streaming txns.
    pub initial_starting_version: Option<u64>,

    /// Even if there is a minimum version in the DB, start streaming txns from this
    /// version.
    pub starting_version_override: Option<u64>,

    /// todo
    pub ending_version: Option<u64>,

    #[serde(default = "GrpcStreamBuilder::default_num_concurrent_processing_tasks")]
    pub num_concurrent_processing_tasks: usize,
}

impl GrpcStreamBuilder {
    const fn default_indexer_grpc_http2_ping_interval() -> Duration {
        Duration::from_secs(30)
    }

    const fn default_indexer_grpc_http2_ping_timeout() -> Duration {
        Duration::from_secs(10)
    }

    const fn default_num_concurrent_processing_tasks() -> usize {
        10
    }
}

/// TODO document how the stream works when it encounters errors, what it returns, etc.

#[async_trait::async_trait]
impl StreamBuilder for GrpcStreamBuilder {
    /// This is the main logic of the processor. We will do a few large parts:
    /// 1. Connect to GRPC and handling all the stuff before starting the stream such as diesel migration
    /// 2. Start a thread specifically to fetch data from GRPC. We will keep a buffer of X batches of transactions
    /// 3. Start a loop to consume from the buffer. We will have Y threads to process the transactions in parallel. (Y should be less than X for obvious reasons)
    ///   * Note that the batches will be sequential so we won't have problems with gaps
    /// 4. We will keep track of the last processed version and monitoring things like TPS
    async fn start(
        &self,
        starting_version_from_db: Option<u64>,
    ) -> Result<StreamHandle, StartStreamError> {
        let processor_name = self.processor_name.clone();

        info!(
            processor_name = processor_name,
            stream_address = self.indexer_grpc_data_service_address.clone(),
            "[Parser] Connecting to GRPC endpoint",
        );

        let channel = tonic::transport::Channel::from_shared(format!(
            "http://{}",
            self.indexer_grpc_data_service_address.clone()
        ))
        .map_err(|e| {
            StartStreamError::InvalidConfiguration(format!(
                "indexer_grpc_data_service_address is not a valid URI: {:#}",
                e,
            ))
        })?
        .http2_keep_alive_interval(self.indexer_grpc_http2_ping_interval)
        .keep_alive_timeout(self.indexer_grpc_http2_ping_timeout);

        let mut rpc_client = match RawDataClient::connect(channel).await {
            Ok(client) => client
                .accept_compressed(tonic::codec::CompressionEncoding::Gzip)
                .send_compressed(tonic::codec::CompressionEncoding::Gzip)
                .max_decoding_message_size(MAX_RESPONSE_SIZE)
                .max_encoding_message_size(MAX_RESPONSE_SIZE),
            Err(e) => {
                error!(
                    processor_name = processor_name,
                    stream_address = self.indexer_grpc_data_service_address.clone(),
                    error = ?e,
                    "[Parser] Error connecting to grpc_stream"
                );
                return Err(StartStreamError::FailedToConnect(format!(
                    "Failed to connect to GRPC endpoint: {:#}",
                    e
                )));
            }
        };

        info!(
            processor_name = processor_name,
            stream_address = self.indexer_grpc_data_service_address.clone(),
            "[Parser] Connected to GRPC endpoint",
        );

        let (starting_version, origin) = match self.starting_version_override {
            Some(version) => {
                info!("Starting from starting_version_override: {}", version);
                (version, "starting_version_override")
            }
            None => match starting_version_from_db {
                Some(version) => {
                    info!("Starting from version found in DB: {}", version);
                    (version, "starting_version_from_db")
                }
                None => match self.initial_starting_version {
                    Some(version) => {
                        info!("Starting from initial_starting_version: {}", version);
                        (version, "initial_starting_version")
                    }
                    None => {
                        info!("No starting_version_override, starting_version_from_db, or initial_starting_version. Starting from version 0");
                        (0, "default")
                    }
                },
            },
        };

        info!(
            processor_name = processor_name,
            stream_address = self.indexer_grpc_data_service_address.clone(),
            starting_version = starting_version,
            starting_version_origin = origin,
            "[Parser] Making request to GRPC endpoint",
        );

        let request = grpc_request_builder(
            starting_version,
            self.ending_version
                .map(|v| (v as i64 - starting_version as i64 + 1) as u64),
            self.auth_token.clone(),
            self.processor_name.clone(),
        );

        let mut resp_stream = rpc_client
            .get_transactions(request)
            .await
            .map_err(|e| {
                StartStreamError::FailedToConnect(format!("Failed to get GRPC response: {:#}", e))
            })?
            .into_inner();

        let concurrent_tasks = self.num_concurrent_processing_tasks;
        info!(
            processor_name = processor_name,
            stream_address = self.indexer_grpc_data_service_address.clone(),
            starting_version = starting_version,
            concurrent_tasks = concurrent_tasks,
            "[Parser] Successfully connected to GRPC endpoint, starting txn fetcher...",
        );

        let batch_start_version = starting_version;

        let ending_version = self.ending_version;
        let indexer_grpc_data_service_address = self.indexer_grpc_data_service_address.clone();

        let (sender, receiver) = tokio::sync::mpsc::channel::<(u64, Vec<Transaction>)>(BUFFER_SIZE);

        // An Arc of mutex protected counter.
        let channel_size = Arc::new(std::sync::Mutex::new(0));
        let channel_size_clone = channel_size;

        // Create a transaction fetcher worker that will continuously fetch transactions from the GRPC stream
        // and write into a channel. Each item will be (chain_id, batch of transactions).
        let join_handle = tokio::spawn(async move {
            info!(
                processor_name = processor_name,
                ending_version = ending_version,
                batch_start_version = batch_start_version,
                "[Parser] Starting fetcher worker"
            );
            // Gets a batch of transactions from the stream. Batch size is set in the grpc server.
            // The number of batches depends on our config.
            // There could be several special scenarios:
            //   1. If we lose the connection, we will stop fetching and let the consumer panic.
            //   2. If we specified an end version and we hit that, we will stop fetching.
            let mut last_insertion_time = std::time::Instant::now();
            while let Some(current_item) = resp_stream.next().await {
                match current_item {
                    Ok(r) => {
                        #[cfg(feature = "counters")]
                        TRANSMITTED_BYTES_COUNT
                            .with_label_values(&[processor_name])
                            .inc_by(r.encoded_len() as u64);

                        let start_version = r.transactions.as_slice().first().unwrap().version;
                        let end_version = r.transactions.as_slice().last().unwrap().version;

                        let chain_id = r.chain_id.expect("[Parser] Chain Id doesn't exist.");
                        match sender.send((chain_id, r.transactions)).await {
                            Ok(()) => {}
                            Err(e) => {
                                error!(
                                    processor_name = processor_name,
                                    stream_address = indexer_grpc_data_service_address,
                                    error = ?e,
                                    "[Parser] Error sending datastream response to channel."
                                );
                                // Note, we don't necessarily want to panic right away because there might be still things in the
                                // channel that we want to process. Let's panic in the consumer side instead, say if there has not
                                // been any data in the channel for a while.
                                break;
                            }
                        }
                        // increase the counter.
                        let mut size = channel_size_clone.lock().unwrap();
                        *size += 1;
                        info!(
                            processor_name = processor_name,
                            start_version = start_version,
                            end_version = end_version,
                            channel_size = *size,
                            channel_recv_latency_in_secs =
                                last_insertion_time.elapsed().as_secs_f64(),
                            "[Parser] Received chunk of transactions."
                        );
                        last_insertion_time = std::time::Instant::now();
                    }
                    Err(rpc_error) => {
                        error!(
                            processor_name = processor_name,
                            stream_address = indexer_grpc_data_service_address,
                            error = ?rpc_error,
                            "[Parser] Error receiving datastream response."
                        );
                        // Note, we don't necessarily want to panic right away because there might be still things in the
                        // channel that we want to process. Let's panic in the consumer side instead, say if there has not
                        // been any data in the channel for a while.
                        break;
                    }
                }
            }
            // All senders are dropped here; channel is closed.
            info!("[Parser] The stream is ended.")
        });

        Ok(StreamHandle {
            join_handle,
            receiver,
        })
    }
}

pub fn grpc_request_builder(
    starting_version: u64,
    transactions_count: Option<u64>,
    grpc_auth_token: String,
    processor_name: String,
) -> tonic::Request<GetTransactionsRequest> {
    let mut request = tonic::Request::new(GetTransactionsRequest {
        starting_version: Some(starting_version),
        transactions_count,
        ..GetTransactionsRequest::default()
    });
    request
        .metadata_mut()
        .insert(GRPC_AUTH_TOKEN_HEADER, grpc_auth_token.parse().unwrap());
    request
        .metadata_mut()
        .insert(GRPC_REQUEST_NAME_HEADER, processor_name.parse().unwrap());
    request
}
