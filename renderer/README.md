# Aptos Canvas: Renderer

This small Rust binary is used to render the canvas state into a PNG image. We compile it into wasm and deploy it on Cloudflare Workers.

## Deployment
```
npx wrangler publish
```

Configure how this command works by editing `wrangler.toml`.
