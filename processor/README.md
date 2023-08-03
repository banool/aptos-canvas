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

the way i parse writetabledata is messed up here:

```
Data: WriteTableData { key: "\"0\"", key_type: "u64", value: "[{\"hash\":\"14433063021597336458\",\"key\":\"73748\",\"value\":{\"b\":52,\"g\":52,\"r\":244}},{\"hash\":\"11865850324349516474\",\"key\":\"75256\",\"value\":{\"b\":233,\"g\":83,\"r\":104}},{\"hash\":\"9579548842148840876\",\"key\":\"76755\",\"value\":{\"b\":243,\"g\":40,\"r\":221}},{\"hash\":\"13477381603061694318\",\"key\":\"65118\",\"value\":{\"b\":233,\"g\":56,\"r\":43}},{\"hash\":\"16953749211572922798\",\"key\":\"61043\",\"value\":{\"b\":237,\"g\":64,\"r\":78}},{\"hash\":\"5638515274435641974\",\"key\":\"37764\",\"value\":{\"b\":52,\"g\":20,\"r\":236}}]", value_type: "vector<0x1::smart_table::Entry<u64, 0x481d6509302e3379b9a8cf524da0000feee18f811d1da7e5addc7f64cdaaac60::canvas_token::Color>>" }
```

rather than it just being a single write, there are many. my guess is this due to bucket rebalancing or something. but this seems to happen for multiple consecutive writes, so maybe the writetabledata will always have all the writes? maybe just normal table is better here. yeah okay SmartTable is just a Table of vectors so that makes sense.

also the key is actually correct, so that's fine.
