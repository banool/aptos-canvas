use crate::generated::{_0x1__object__Object, _0x1__smart_table__Entry, _0x3__canvas_token__Color};
use anyhow::{Context as AnyhowContext, Result};
use aptos_move_graphql_scalars::Address;
use aptos_processor_framework::{
    indexer_protos::transaction::v1::{
        transaction::TxnData, transaction_payload::Payload, write_set_change::Change,
        EntryFunctionId, MoveModuleId, Transaction,
    },
    txn_parsers::get_clean_entry_function_payload,
    ProcessingResult, ProcessorTrait,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tracing::{debug, error, info, warn};

const CANVAS_TOKEN_MODULE_NAME: &str = "canvas_token";

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct CanvasProcessorConfig {
    pub canvas_contract_address: String,
}

#[derive(Debug)]
pub struct CanvasProcessor {
    config: CanvasProcessorConfig,
}

impl CanvasProcessor {
    pub fn new(config: CanvasProcessorConfig) -> Self {
        Self { config }
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
        let mut all_pixels_to_write = Vec::new();
        for transaction in transactions {
            // todo process canvas_token::create and create images for that
            // todo create a storage interface with like create that takes in a default color
            // a width and height, then methods for writing pixels to it, and also reading
            // the full thing. it should handle the read update write process inside it
            let pixel_to_write = self.process_draw(&transaction).await?;
            all_pixels_to_write.push(pixel_to_write);
        }
        info!(
            start_version = start_version,
            end_version = end_version,
            processor_name = self.name(),
            num_pixels_to_write = all_pixels_to_write.len()
        );

        // Write pixels.

        Ok((start_version, end_version))
    }
}

impl CanvasProcessor {
    async fn process_draw(&self, transaction: &Transaction) -> Result<Option<Pixel>> {
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

        let function_id = entry_function_payload
            .function
            .as_ref()
            .context("No function")?;

        let clean_entry_function_payload =
            get_clean_entry_function_payload(&entry_function_payload, 0);

        let draw_function_id = EntryFunctionId {
            module: Some(MoveModuleId {
                address: self.config.canvas_contract_address.clone(),
                name: CANVAS_TOKEN_MODULE_NAME.to_string(),
            }),
            name: "draw".to_string(),
        };

        // Skip this transaction if this wasn't a draw transaction.
        if function_id != &draw_function_id {
            return Ok(None);
        }

        eprintln!(
            "canvas_address: {:?}",
            clean_entry_function_payload.arguments
        );

        let first_arg = clean_entry_function_payload.arguments[0].clone();

        let obj: _0x1__object__Object = serde_json::from_value(first_arg).unwrap();
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
                    let value: _0x1__smart_table__Entry =
                        serde_json::from_value(values.into_iter().next().unwrap()).unwrap();
                    let index = value.key.as_str().unwrap().parse::<u64>().unwrap();
                    let color: _0x3__canvas_token__Color =
                        serde_json::from_value(value.value).unwrap();
                    return Ok(Some(Pixel {
                        canvas_address: canvas_address.clone(),
                        index,
                        color,
                    }));
                },
                _ => continue,
            }
        }

        Ok(None)
    }
}

#[derive(Clone, Debug)]
struct Pixel {
    /// The address of the object containing the canvas.
    pub canvas_address: Address,
    pub index: u64,
    pub color: _0x3__canvas_token__Color,
}

// Functions we need:
// - Make it easier to pull out the entry function payload, one function.
// - Something like get_clean_* for each of the Change:: variants, like WriteTableData.
