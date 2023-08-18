mod schema;

use crate::{canvas_storage::CanvasStorageTrait, db_storage::PostgresStorage};
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use async_graphql::{
    dataloader::DataLoader,
    http::{playground_source, GraphQLPlaygroundConfig},
};
use async_graphql_poem::GraphQL;
use poem::{
    get, handler,
    http::Method,
    listener::TcpListener,
    middleware::{Cors, Tracing},
    web::{Data, Html, Path},
    EndpointExt, IntoResponse, Response, Route, Server,
};
use schema::{build_schema, OrmDataloader};
use serde::{Deserialize, Serialize};
use std::{str::FromStr, sync::Arc};
use tracing::info;

const GQL_ENDPOINT: &str = "/gql";

#[handler]
async fn get_image(
    // This gives me a higher order lifetime error.
    canvas_storage: Data<&Arc<dyn CanvasStorageTrait>>,
    Path(address): Path<String>,
) -> poem::Result<Response> {
    let address = if address.ends_with(".png") {
        address[..address.len() - 4].to_string()
    } else {
        address
    };
    let address = Address::from_str(&address).context("Invalid address")?;
    let png_data = canvas_storage
        .get_canvas_as_png(&address)
        .await
        .with_context(|| {
            format!(
                "Failed to get image for address {}",
                address.to_canonical_string()
            )
        })
        .unwrap();
    Ok(Response::builder()
        .body(png_data)
        .set_content_type("image/png"))
}

#[handler]
async fn graphql_playground() -> impl IntoResponse {
    Html(playground_source(GraphQLPlaygroundConfig::new(
        GQL_ENDPOINT,
    )))
}

#[handler]
async fn root() -> String {
    "No problems baby!!".to_string()
}

pub struct Api {
    config: ApiConfig,
    canvas_storage: Arc<dyn CanvasStorageTrait>,
    db_storage: Arc<PostgresStorage>,
}

impl Api {
    pub fn new(
        config: ApiConfig,
        canvas_storage: Arc<dyn CanvasStorageTrait>,
        db_storage: Arc<PostgresStorage>,
    ) -> Self {
        Self {
            config,
            canvas_storage,
            db_storage,
        }
    }

    pub async fn start_api(&self) -> Result<()> {
        // Build the GraphQL stuff.
        let depth_limit = None;
        let complexity_limit = None;
        let connection = self.db_storage.connection.clone();
        let orm_dataloader: DataLoader<OrmDataloader> = DataLoader::new(
            OrmDataloader {
                db: connection.clone(),
            },
            tokio::spawn,
        );
        let schema = build_schema(connection, orm_dataloader, depth_limit, complexity_limit)
            .context("Failed to build schema")?;

        // Build the routes.
        let cors = Cors::new().allow_methods(vec![Method::GET, Method::POST]);
        let app = Route::new()
            .at("/", get(root))
            .at(
                GQL_ENDPOINT,
                get(graphql_playground).post(GraphQL::new(schema)),
            )
            .at("/media/:address", get(get_image))
            .data(self.canvas_storage.clone())
            .with(cors)
            .with(Tracing);

        // Run the server.
        info!("API server starting");
        Server::new(TcpListener::bind((
            self.config.listen_address.as_str(),
            self.config.api_port,
        )))
        .name("api")
        .run(app)
        .await
        .context("API server ended unexpectedly")
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ApiConfig {
    #[serde(default = "ApiConfig::default_listen_address")]
    pub listen_address: String,

    #[serde(default = "ApiConfig::default_api_port")]
    pub api_port: u16,
}

impl ApiConfig {
    pub fn default_listen_address() -> String {
        "0.0.0.0".to_string()
    }

    pub fn default_api_port() -> u16 {
        7645
    }
}
