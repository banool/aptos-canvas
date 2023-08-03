use anyhow::{Context, Result};
use aptos_processor_framework::StorageTrait;
use entities::{chain_id, last_processed_version};
use migrations::{Migrator, MigratorTrait};
use sea_orm::{
    sea_query::OnConflict, ActiveModelTrait, ConnectionTrait, Database, DatabaseConnection,
    DatabaseTransaction, DbBackend, EntityTrait, QueryTrait, TransactionTrait,
};
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct PostgresStorageConfig {
    pub connection_string: String,
}

#[derive(Debug)]
pub struct PostgresStorage {
    connection: DatabaseConnection,
}

impl PostgresStorage {
    pub async fn new(config: PostgresStorageConfig) -> Result<Self> {
        // Build the DB connection.
        let connection = Database::connect(&config.connection_string)
            .await
            .context("Failed to connect to DB")?;

        // Apply migrations if necessary.
        Migrator::up(&connection, None)
            .await
            .context("Failed to apply migrations")?;

        Ok(Self { connection })
    }
}

#[async_trait::async_trait]
impl StorageTrait for PostgresStorage {
    async fn read_chain_id(&self) -> Result<Option<u8>> {
        Ok(chain_id::Entity::find()
            .one(&self.connection)
            .await
            .context("Failed to read ChainId")?
            .map(|chain_id| chain_id.chain_id as u8))
    }

    async fn write_chain_id(&self, chain_id: u8) -> Result<()> {
        let tx: DatabaseTransaction = self.connection.begin().await?;
        let existing_chain_id = chain_id::Entity::find()
            .one(&tx)
            .await
            .context("Failed to read ChainId for update")?;

        // TODO: Make this use on_conflict like with write_last_processed_version.

        if let Some(existing_chain_id) = existing_chain_id {
            // Update the existing row if there is one
            let mut existing_chain_id: chain_id::ActiveModel = existing_chain_id.into();
            existing_chain_id.chain_id = sea_orm::Set(chain_id as i16);
            existing_chain_id.update(&tx).await?
        } else {
            // Insert a new row if there are zero rows
            let new_chain_id = chain_id::ActiveModel {
                chain_id: sea_orm::Set(chain_id as i16),
            };
            new_chain_id.insert(&tx).await?
        };

        tx.commit()
            .await
            .context("Failed to commit transaction to write chain ID")
    }

    async fn read_last_processed_version(&self, processor_name: &str) -> Result<Option<u64>> {
        Ok(last_processed_version::Entity::find_by_id(processor_name)
            .one(&self.connection)
            .await
            .context("Failed to read ChainId")?
            .map(|lpv| lpv.version as u64))
    }

    async fn write_last_processed_version(&self, processor_name: &str, version: u64) -> Result<()> {
        let lpv = last_processed_version::ActiveModel {
            processor_name: sea_orm::Set(processor_name.to_string()),
            version: sea_orm::Set(version as i64),
        };

        // Build a query that will insert a new row if there are zero rows, or update the existing
        // row if there is one.
        let query = last_processed_version::Entity::insert(lpv)
            .on_conflict(
                OnConflict::column(last_processed_version::Column::ProcessorName)
                    .update_column(last_processed_version::Column::ProcessorName)
                    .value(last_processed_version::Column::Version, version)
                    .to_owned(),
            )
            .build(DbBackend::Postgres);

        self.connection
            .execute(query)
            .await
            .context("Failed to update last processed version")?;

        Ok(())
    }
}
