# Aptos Canvas: Move

## Helpful test commands

Publish dport std (run from within aptos-dport-std):
```
curl -X POST "localhost:8081/mint?amount=1000000000&address=`yq .profiles.local.account < .aptos/config.yaml`" && sleep 1 && aptos move publish --profile local --assume-yes --skip-fetch-latest-git-deps
```

Create an account and publish this package:
```
rm -rf .aptos/config.yaml && yes '' | aptos init --network local && aptos move publish --skip-fetch-latest-git-deps --named-addresses addr=`yq .profiles.default.account < .aptos/config.yaml` --assume-yes
```

Create the collection:
```
aptos move run --assume-yes --function-id `yq .profiles.default.account < .aptos/config.yaml`::canvas_collection::create
```

Create a canvas:
```
aptos move run --assume-yes --function-id `yq .profiles.default.account < .aptos/config.yaml`::canvas_token::create --args string:"My Canvas" string:"My Canvas" u32:50 u32:50 u64:0 u64:0 u8:0 u8:0 u8:0 bool:false
```

Get the address of the object created by the previous command:
```
curl localhost:8080/v1/transactions/by_hash/0xe6a7b044015180e07e5878dc8d87729010fa25241d76ea34b2ebc003e9b64e6b | jq -r .events[0].data.token
```

## Generating schema
```
aptos move generate-schema --named-addresses addr=0x3 --schema-path ../frontend/src/generated
```
