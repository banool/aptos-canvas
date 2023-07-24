# Aptos Canvas

Aptos Canvas is a fully on-chain rendition of [Reddit Place](https://www.reddit.com/r/place/). Some of the things you can do with it include:
- Make an on-chain canvas of configurable size.
- Set a per-account timeout for drawing on the canvas.
- Restrict who can draw on the canvas.
- Designate yourself a super admin, which lets you appoint admins to manage access, clear the canvas, etc.
- Specify a cost for drawing a pixel.
- Set an overall TTL for canvas, e.g. your canvas might be writeable for only 1 day and then be locked forever, a moment in time.

All this functionality exists in the Move module. At the time of writing the frontend supports a decent subset of this stuff, mostly everything minus the admin stuff.

It is worth noting that each canvas is actually a v2 token; they can be traded, sold, etc. Anything you can do with a regular v2 token you can do with a canvas. Given each canvas is itself essentially an image, each token can be easily self described entirely from the on-chain data, meaning a custom marketplace display module could use the canvas itself rather than the metadata URI to show the token. For marketplaces that don't support this, the URI could be a server / cloud function that looks up the canvas data on chain and returns it as an image. This is not implemented yet but tracked in https://github.com/banool/aptos-canvas/issues/5.

This is a rare example of a token that is constantly changing. The value is not necessarily derived from the token at any given point, but by a rich history of interesting art / community throughout time.

