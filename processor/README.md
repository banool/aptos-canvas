# Aptos Canvas: Processor

Spin up a local development environment (node API + txn stream service):
```
cd aptos-core
cd testsuite
docker container prune -f
DOCKER_DEFAULT_PLATFORM=linux/amd64 poetry run python indexer_grpc_local.py start
```

Run the processor:
```
rm -rf /tmp/canvases && mkdir /tmp/canvases && cargo run -p service -- --config-path configs/local.yaml
```

The API will be running at http://127.0.0.1:7645. You can access the gql playground at http://127.0.0.1:7645/gql.

## Updating DB
Install the necessary tools:
```
cargo install sea-orm-cli@^0.12
```

To change the DB, first go to `migrations/` and create a new migration (see the README there).

To run migrations, assuming you have already created a `canvas` database:
```
sea-orm-cli migrate -d migrations --database-url postgres://dport:@localhost/canvas
```

Now, to generate entities with GraphQL hooked up, do this:
```
sea-orm-cli generate entity --lib --seaography -o entities/src --database-url postgres://dport:@localhost:5432/canvas
```

If you added a new table, make sure to go register it with the API GraphQL schema at `service/src/api/schema.rs`.

## Notes
- The GraphQL API only accepts account addresses in LONG form without the leading 0x. It returns them the same way.
- For now, the best way to get the schema.graphql file is to go to http://127.0.0.1:7645/gql and use the Download -> SDL button.
