use image::{codecs::png::PngEncoder, ColorType, ImageBuffer, ImageEncoder, Rgb};
use serde::{Deserialize, Serialize};
use worker::{event, Context, Env, Request, Response, Result};

#[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
use worker::console_log;

enum Network {
    Local,
    Devnet,
    Testnet,
    Mainnet,
}

impl std::fmt::Display for Network {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Network::Local => unimplemented!(),
            Network::Devnet => write!(f, "devnet"),
            Network::Testnet => write!(f, "testnet"),
            Network::Mainnet => write!(f, "mainnet"),
        }
    }
}

impl Network {
    fn from_chain_id(s: u8) -> Self {
        match s {
            4 => Network::Local,
            2 => Network::Testnet,
            1 => Network::Mainnet,
            _ => Network::Devnet,
        }
    }

    /// Get the address of the canvas module.
    fn module_address(&self) -> &'static str {
        match self {
            Network::Local => unimplemented!(),
            Network::Devnet => unimplemented!(),
            Network::Testnet => {
                "0x6286dfd5e2778ec069d5906cd774efdba93ab2bec71550fa69363482fbd814e7"
            }
            Network::Mainnet => unimplemented!(),
        }
    }
}

fn log_error<T: std::fmt::Debug>(e: T) -> T {
    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Error: {:?}", e);
    e
}

#[event(fetch)]
async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    // Parse request.
    let url = req.url()?;
    let canvas_address = url.path().trim_start_matches("/").to_string();

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Canvas address: {}", canvas_address);

    let network = Network::from_chain_id(
        url.query_pairs()
            .find(|(key, _)| key == "chain_id")
            .ok_or_else(|| "chain_id not found in URL")
            .map_err(log_error)?
            .1
            .parse::<u8>()
            .map_err(log_error)
            .map_err(|e| format!("Failed to parse chain_id: {}", e))?,
    );

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Network: {}", network);

    let (pixels, width, height) = get_canvas_pixels(network, canvas_address).await?;

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!(
        "Got pixels for canvas with width / height: {} / {}",
        width,
        height
    );

    let image_bytes = get_image(pixels, width, height)
        .map_err(|e| format!("Failed to get PNG bytes: {:#}", e))?;

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Got image bytes as PNG");

    let mut response = Response::from_bytes(image_bytes)
        .map_err(|e| format!("Failed to build response from PNG bytes: {:#}", e))?;
    response
        .headers_mut()
        .set("content-type", "image/png")
        .unwrap();

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Returning response!!");

    Ok(response)
}

#[derive(Deserialize, Debug, Serialize)]
struct Color {
    r: u8,
    g: u8,
    b: u8,
}

async fn get_canvas_pixels(
    network: Network,
    canvas_address: String,
) -> Result<(Vec<Color>, u32, u32)> {
    // Get the canvas resource.
    let resource_name = format!("{}::canvas_token::Canvas", network.module_address());
    let url = format!(
        "https://fullnode.{}.aptoslabs.com/v1/accounts/{}/resource/{}",
        network, canvas_address, resource_name,
    );

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Requesting data from {}", url);

    let response = reqwest::get(&url).await.map_err(|e| format!("{:#}", e))?;

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Got response from {}", url);

    let mut json = response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("{:#}", e))?;

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("JSON data from {}: {}", url, json);

    // Parse the data of the resource.
    let mut data = json.get_mut("data").expect("No key data").take();
    let mut config = data.get_mut("config").expect("No key config").take();

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("Config: {:?}", config);

    let width = config
        .get_mut("width")
        .expect("No key width")
        .take()
        .as_str()
        .unwrap()
        .parse::<u32>()
        .expect("Failed to parse width");

    let height = config
        .get_mut("height")
        .expect("No key height")
        .take()
        .as_str()
        .unwrap()
        .parse::<u32>()
        .expect("Failed to parse height");

    let pixels: Vec<Color> =
        serde_json::from_value(data.get_mut("pixels").expect("No key pixels").take())
            .expect("Failed to parse pixels");

    Ok((pixels, width, height))
}

fn get_image(pixels: Vec<Color>, width: u32, height: u32) -> Result<Vec<u8>> {
    let mut image_buffer = ImageBuffer::new(width, height);

    #[cfg(all(target_arch = "wasm32", target_os = "unknown"))]
    console_log!("width: {}, height: {}", width, height);

    for (x, y, pixel) in image_buffer.enumerate_pixels_mut() {
        let color = &pixels[(y * width + x) as usize];
        *pixel = Rgb([color.r, color.g, color.b]);
    }

    // Create a buffer to hold the png
    let mut buffer: Vec<u8> = Vec::new();

    // Create a PNG encoder
    let encoder = PngEncoder::new(&mut buffer);

    // Write the image_buffer data to the buffer as PNG
    encoder
        .write_image(&image_buffer.into_raw(), width, height, ColorType::Rgb8)
        .map_err(|e| format!("Failed to create png: {:#}", e))?;

    Ok(buffer)
}

#[cfg(test)]
mod test {
    use super::*;

    #[tokio::test]
    async fn test_all() {
        let pixels = get_canvas_pixels(
            Network::Testnet,
            "0xa7b52eb38f27f7bc1721ccb329de8c4bb969ea39992e1c2a1d4a2d9661b53251".to_string(),
        )
        .await
        .unwrap();
        let image = get_image(pixels.0, pixels.1, pixels.2).unwrap();

        std::fs::write("/tmp/test.png", image).unwrap();
    }
}
