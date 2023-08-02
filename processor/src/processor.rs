use crate::{
    canvas_storage::{CanvasStorageTrait, CreateCanvasIntent, WritePixelIntent},
    generated::{Canvas, Color, Entry, Object},
};
use anyhow::{Context as AnyhowContext, Result};
use aptos_move_graphql_scalars::Address;
use aptos_processor_framework::{
    indexer_protos::transaction::v1::{
        transaction::TxnData, transaction_payload::Payload, write_set_change::Change,
        EntryFunctionId, MoveModuleId, MoveStructTag, Transaction,
    },
    txn_parsers::get_clean_entry_function_payload,
    ProcessingResult, ProcessorTrait,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{str::FromStr, sync::Arc};
use tracing::info;

const CANVAS_TOKEN_MODULE_NAME: &str = "canvas_token";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CanvasProcessorConfig {
    pub canvas_contract_address: String,
}

#[derive(Debug)]
pub struct CanvasProcessor {
    config: CanvasProcessorConfig,
    canvas_storage: Arc<dyn CanvasStorageTrait>,
}

impl CanvasProcessor {
    pub fn new(config: CanvasProcessorConfig, canvas_storage: Arc<dyn CanvasStorageTrait>) -> Self {
        Self {
            config,
            canvas_storage,
        }
    }

    pub fn get_canvas_struct_tag(&self) -> MoveStructTag {
        MoveStructTag {
            address: self.config.canvas_contract_address.clone(),
            module: CANVAS_TOKEN_MODULE_NAME.to_string(),
            name: "Canvas".to_string(),
            generic_type_params: vec![],
        }
    }
}

/// A processor that just prints the txn version.
#[async_trait::async_trait]
impl ProcessorTrait for CanvasProcessor {
    fn name(&self) -> &'static str {
        "CanvasProcessor"
    }

    async fn process_transactions(
        &self,
        transactions: Vec<Transaction>,
        start_version: u64,
        end_version: u64,
    ) -> Result<ProcessingResult> {
        let mut all_create_canvas_intents = Vec::new();
        let mut all_write_pixel_intents = Vec::new();
        for transaction in transactions {
            // todo process canvas_token::create and create images for that
            // todo create a storage interface with like create that takes in a default color
            // a width and height, then methods for writing pixels to it, and also reading
            // the full thing. it should handle the read update write process inside it
            let write_pixel_intents = self
                .process_draw(&transaction)
                .context("Failed at process_draw")?;
            if let Some(write_pixel_intents) = write_pixel_intents {
                all_write_pixel_intents.push(write_pixel_intents);
            }
            let create_canvas_intent = self
                .process_create(&transaction)
                .context("Failed at process_create")?;
            if let Some(create_canvas_intent) = create_canvas_intent {
                all_create_canvas_intents.push(create_canvas_intent);
            }
        }
        info!(
            start_version = start_version,
            end_version = end_version,
            processor_name = self.name(),
            num_canvases_to_create = all_create_canvas_intents.len(),
            num_pixels_to_write = all_write_pixel_intents.len()
        );

        // TODO: Parallelize this.

        // Create canvases.
        for create_canvas_intent in all_create_canvas_intents {
            self.canvas_storage
                .create_canvas(create_canvas_intent)
                .await
                .context("Failed to create canvas in storage")?;
        }

        // Write pixels.
        for write_pixel_intent in all_write_pixel_intents {
            self.canvas_storage
                .write_pixel(write_pixel_intent)
                .await
                .context("Failed to write pixel in storage")?;
        }

        Ok((start_version, end_version))
    }
}

impl CanvasProcessor {
    fn process_draw(&self, transaction: &Transaction) -> Result<Option<WritePixelIntent>> {
        // Skip this transaction if this wasn't a draw transaction.
        let draw_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "draw".to_string(),
        };
        if !entry_function_id_matches(transaction, &draw_function_id) {
            return Ok(None);
        }

        let txn_data = transaction.txn_data.as_ref().context("No txn_data")?;
        let user_transaction = match txn_data {
            TxnData::User(user_transaction) => user_transaction,
            _ => return Ok(None),
        };
        let request = user_transaction.request.as_ref().context("No request")?;
        let payload = request.payload.as_ref().unwrap();
        let entry_function_payload = match payload.payload.as_ref().context("No payload")? {
            Payload::EntryFunctionPayload(payload) => payload,
            _ => return Ok(None),
        };

        let clean_entry_function_payload =
            get_clean_entry_function_payload(entry_function_payload, 0);

        let first_arg = clean_entry_function_payload.arguments[0].clone();

        let obj: Object = serde_json::from_value(first_arg).unwrap();
        let canvas_address = obj.inner;

        let draw_value_type = format!(
            "vector<0x1::smart_table::Entry<u64, {}::canvas_token::Color>>",
            self.config.canvas_contract_address
        );

        let info = transaction.info.as_ref().context("No info")?;

        for change in &info.changes {
            match change.change.as_ref().context("No change")? {
                Change::WriteTableItem(resource) => {
                    let data = resource.data.as_ref().context("No WriteTableItem data")?;
                    if data.value_type != draw_value_type {
                        continue;
                    }
                    let values: Vec<Value> = serde_json::from_str(&data.value).unwrap();
                    let value: Entry = serde_json::from_value(values.into_iter().next().unwrap())
                        .context("Failed to parse as Entry")?;
                    let index = value.key.as_str().unwrap().parse::<u64>().unwrap();
                    let color: Color = serde_json::from_value(value.value).unwrap();
                    return Ok(Some(WritePixelIntent {
                        canvas_address,
                        index,
                        color,
                    }));
                },
                _ => continue,
            }
        }
        Ok(None)
    }

    fn process_create(&self, transaction: &Transaction) -> Result<Option<CreateCanvasIntent>> {
        // Skip this transaction if this wasn't a draw transaction.
        let draw_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "create".to_string(),
        };
        if !entry_function_id_matches(transaction, &draw_function_id) {
            return Ok(None);
        }

        let info = transaction.info.as_ref().context("No info")?;

        for change in &info.changes {
            match change.change.as_ref().context("No change")? {
                Change::WriteResource(resource) => {
                    if resource.r#type.as_ref().unwrap() != &self.get_canvas_struct_tag() {
                        continue;
                    }
                    let canvas: Canvas =
                        serde_json::from_str(&resource.data).context("Failed to parse Canvas")?;
                    return Ok(Some(CreateCanvasIntent {
                        canvas_address: Address::from_str(&resource.address).unwrap(),
                        width: canvas.config.width.0,
                        height: canvas.config.height.0,
                        default_color: canvas.config.default_color,
                    }));
                },
                _ => continue,
            }
        }
        Ok(None)
    }
}

fn entry_function_id_matches(
    transaction: &Transaction,
    entry_function_id: &EntryFunctionId,
) -> bool {
    let txn_data = transaction
        .txn_data
        .as_ref()
        .context("No txn_data")
        .unwrap();
    let user_transaction = match txn_data {
        TxnData::User(user_transaction) => user_transaction,
        _ => return false,
    };
    let request = user_transaction
        .request
        .as_ref()
        .context("No request")
        .unwrap();
    let payload = request.payload.as_ref().unwrap();
    let entry_function_payload = match payload.payload.as_ref().context("No payload").unwrap() {
        Payload::EntryFunctionPayload(payload) => payload,
        _ => return false,
    };

    let function_id = entry_function_payload
        .function
        .as_ref()
        .context("No function")
        .unwrap();

    function_id == entry_function_id
}

// Functions we need:
// - Make it easier to pull out the entry function payload, one function.
// - Something like get_clean_* for each of the Change:: variants, like WriteTableData.
// - This entry_function_id_matches function above.
