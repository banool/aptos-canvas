# Aptos Canvas: Move

## Helpful test commands

First:
```
export NETWORK=local
```

Publish dport std (run from within aptos-dport-std):
```
curl -X POST "localhost:8081/mint?amount=1000000000&address=`yq .profiles.$NETWORK.account < .aptos/config.yaml`" && sleep 1 && aptos move publish --profile $NETWORK --assume-yes
```

Create the local account on chain and publish this package:
```
aptos init --network local --private-key 0x9bd759c66531662ad734d501db59809d9a803b0827696f7330dbbe42a183e68e --profile $NETWORK --assume-yes && aptos move publish --named-addresses addr=`yq .profiles.$NETWORK.account < .aptos/config.yaml` --assume-yes --profile $NETWORK
```

Create the collection:
```
aptos move run --assume-yes --function-id `yq .profiles.$NETWORK.account < .aptos/config.yaml`::canvas_collection::create --profile $NETWORK
```

Create a canvas:
```
aptos move run --assume-yes --function-id `yq .profiles.$NETWORK.account < .aptos/config.yaml`::canvas_token::create --args string:"My Canvas" string:"My Canvas" u64:50 u64:40 u64:0 u64:0 u64:0 u8:255 u8:255 u8:255 bool:false --profile $NETWORK
```

Get the address of the object created by the previous command:
```
curl localhost:8080/v1/transactions/by_hash/0xe6a7b044015180e07e5878dc8d87729010fa25241d76ea34b2ebc003e9b64e6b | jq -r .events[0].data.token
```

Drawing on the canvas:
```
aptos move run --assume-yes --function-id `yq .profiles.$NETWORK.account < .aptos/config.yaml`::canvas_token::draw --args address:0x123 u64:42 u64:24 u8:64 u8:215 u8:178 --profile $NETWORK
```


## Generating schema
Using an Aptos CLI built from the `banool/rust-move-codegen` branch.
```
aptos move generate schema --named-addresses addr=0x3 --schema-path ./
```

The from within `frontend/` run this:
```
pnpm generate-canvas-types
```

For Rust code, you can generate it with the CLI directly. Use this:
```
aptos move generate rust --named-addresses addr=0x3 --generate-to ../processor/src/generated
```
