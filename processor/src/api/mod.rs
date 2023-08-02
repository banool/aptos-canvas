use crate::canvas_storage::CanvasStorageTrait;
use anyhow::{Context, Result};
use aptos_move_graphql_scalars::Address;
use poem::{
    get, handler,
    listener::TcpListener,
    middleware::Tracing,
    web::{Data, Path},
    EndpointExt, Response, Route, Server,
};
use serde::{Deserialize, Serialize};
use std::{str::FromStr, sync::Arc};

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

pub struct Api {
    config: ApiConfig,
    canvas_storage: Arc<dyn CanvasStorageTrait>,
}

impl Api {
    pub fn new(config: ApiConfig, canvas_storage: Arc<dyn CanvasStorageTrait>) -> Self {
        Self {
            config,
            canvas_storage,
        }
    }

    pub async fn start_api(&self) -> Result<()> {
        let app = Route::new()
            .at("/media/:address", get(get_image))
            .data(self.canvas_storage.clone())
            .with(Tracing);
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
