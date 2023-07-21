# Aptos Canvas: Move

## Helpful test commands

Publish dport std (run from within aptos-dport-std):
```
curl -X POST "localhost:8081/mint?amount=1000000000&address=`yq .profiles.local.account < .aptos/config.yaml`" && sleep 1 && aptos move publish --profile local --assume-yes --skip-fetch-latest-git-deps
```

Create the collection:
```
aptos move run --assume-yes --function-id `yq .profiles.default.account < .aptos/config.yaml`::canvas_collection::create
```

Create a canvas:
```
aptos move run --assume-yes --function-id `yq .profiles.default.account < .aptos/config.yaml`::canvas_token::create --args string:"My Canvas" string:"My Canvas" u32:1600 u32:900 u64:0 u64:0 u8:0 u8:0 u8:0 bool:false
```

## Generating schema
```
aptos move generate-schema --named-addresses addr=0x3 --schema-path ../frontend/src/generated
```
