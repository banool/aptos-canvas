# Aptos Canvas: Processor

To run the processor:
```
rm -rf /tmp/canvases && mkdir /tmp/canvases && cargo run -p service -- --config-path config.yaml
```

to generate the API from the DB. you have to have all the seaorm stuff already done and have tables in the db.

seaography-cli --framework poem --complexity-limit 3 --depth-limit 3 postgres://user:pass@127.0.0.1/hey testing testing

for now I'm not making the storages and whatnot configurable.

To run migrations, assuming you have already created a `canvas` database:
```
sea-orm-cli migrate -d migrations --database-url postgres://dport:@localhost/canvas
```

To generate entities (which uses the data in the DB):
```
sea-orm-cli generate entity --lib --seaography -o entities/src  --database-url postgres://dport:@localhost:5432/canvas
```

todo make it possible to disable running the processor and just run the API
