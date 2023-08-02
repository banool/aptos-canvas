mod api;
mod canvas_storage;
mod config;
mod generated;
mod processor;
mod storage;

use crate::{
    config::{Args, Config},
    processor::CanvasProcessor,
    storage::MemoryStorage,
};
use anyhow::{Context as AnyhowContext, Result};
use api::Api;
use aptos_processor_framework::{
    Dispatcher, GrpcStreamSubscriber, ProcessorTrait, StorageTrait, StreamSubscriberTrait,
};
use canvas_storage::MmapCanvasStorage;
use clap::Parser;
use std::sync::Arc;
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

#[tokio::main]
async fn main() -> Result<()> {
    let args = Args::parse();
    let config = Config::try_from(args)?;

    let subscriber = FmtSubscriber::builder()
        // All spans of this level or more severe will be written to stdout.
        .with_max_level(Level::INFO)
        .finish();

    tracing::subscriber::set_global_default(subscriber)
        .context("Setting default tracing subscriber failed")?;

    // Build canvas storage, which is what lets us read and write to the representation
    // of the canvas on disk.
    let canvas_storage = Arc::new(MmapCanvasStorage::new(config.canvas_storage_config.clone()));

    // Build the storage, which is what lets us read and write to the DB. This is
    // generally necessary for all processors since they need somewhere to at least
    // keep track of the last version they processed.
    let storage = Arc::new(MemoryStorage::new());

    // Build the canvas processor, which is what processes transactions and updates the
    // canvas storage and the DB.
    let processor = Arc::new(CanvasProcessor::new(
        config.canvas_processor_config.clone(),
        canvas_storage.clone(),
    ));

    // From the DB, read the last version we processed.
    let starting_version_from_db = storage
        .read_last_processed_version(processor.name())
        .await?;

    // Determine the actual version we'll start from based on the data in the DB and
    // the values in the config.
    let starting_version = config
        .common_storage_config
        .determine_starting_version(starting_version_from_db);

    // Build the stream subscriber, which subscribes to txn stream service and pushes
    // the txns to an internal channel.
    let stream_subscriber = GrpcStreamSubscriber {
        config: config.stream_subscriber_config.clone(),
        processor_name: processor.name().to_string(),
        starting_version,
    };

    // Start the stream subscriber.
    // TODO: Idk if this should spawn a tokio worker, it should just return a
    // future that the caller and do whatever they want with.
    let channel_handle = stream_subscriber.start().await?;

    // Build the dispatcher, which is what reads from the channel and dispatches txns
    // to the processor.
    let mut dispatcher = Dispatcher {
        config: config.dispatcher_config.clone(),
        storage: storage.clone(),
        processor: processor.clone(),
        receiver: channel_handle.receiver,
        starting_version,
    };

    // Build the API, which can serve the canvases as pngs and also serve any of the
    // restructured information the processor put in the DB.
    let api = Api::new(config.api_config.clone(), canvas_storage.clone());

    let api_fut = api.start_api();
    let dispatcher_fut = dispatcher.dispatch();
    let result = futures::join!(api_fut, dispatcher_fut);

    Err(anyhow::anyhow!(
        "One of the futures finished unexpectedly: {:#?}",
        result
    ))
}

// For some reason the below snippet fails to compile with the following error:
//
// error: higher-ranked lifetime error
//    --> src/main.rs:100:18
//     |
// 100 |     futures.push(Box::pin(async move { api.start_api().await }));
//     |                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//     |
//     = note: could not prove `Pin<std::boxed::Box<[async block@src/main.rs:100:27: 100:63]>>: CoerceUnsized<Pin<std::boxed::Box<(dyn futures::Future<Output = std::result::Result<(), anyhow::Error>> + std::marker::Send + 'a)>>>`

//api.start_api().await

/*
let mut futures: Vec<Pin<Box<dyn futures::Future<Output = Result<()>> + Send>>> = Vec::new();

// Start the dispatcher.
futures.push(Box::pin(async move {
    dispatcher.dispatch().await;
    Err(anyhow::anyhow!("Dispatcher finished unexpectedly"))
}));

// Start the API.
futures.push(Box::pin(async move { api.start_api().await }));

// Wait for all the futures. We expect none of them to ever end.
futures::future::select_all(futures)
    .await
    .0
    .context("One of the futures that were not meant to end ended unexpectedly")
*/
