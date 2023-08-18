# Aptos Canvas: Frontend

The frontend lets you do the following:
1. Create canvases.
1. View canvases.
1. Draw on canvases.
1. Perform various admin operations.

For token-related operations use a marketplace.

## Development
To get started, run:
```
pnpm install
pnpm start
```

To format your code:
```
pnpm fmt
```

## Generated Code
To generate the code for interacting with the processor, do this:
```
pnpm generate-processor-gql
```

To generate the code for interacting with Move resources from the node API, do this:
```
pnpm generate-canvas-gql
```

To learn how to get the schemas for these, see the READMEs in the `processor/` and `move/` directories.

## Deployment
The site is deployed automatically via GitHub Pages.
