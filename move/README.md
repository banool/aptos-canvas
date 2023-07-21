# Aptos Tontine: Move

## Notes on the asset pool
At the core of the tontine is the asset pool. Members contribute assets to the pool and eventually, one person walks away with all the assets. Another consideration is that it should be possible for users to withdraw their assets before the tontine begins. Multiple options were considered here. In the end I decided that it was best to go with the first option below.

### Store specific assets
This is some pseudo-code demonstrating how this would work:
```move
struct Tontine {
    assets: SimpleMap<addr, Assets>
}

struct Assets has key {
    coins: AptosCoin,
    tokens: vector<Token>
}

public entry fun deposit_coins(depositor: &addr, tontine_addr: addr, coins: AptosCoin) {
    let assets = borrow_global_mut<Tontine>(tontine_addr).assets;
    let depositor_assets = simple_map::get(assets, depositor);
    coin::merge(depositor_assets.coins, coins);
}

public entry fun deposit_tokens(depositor: &addr, tontine_addr: addr, token: Token) {
    let assets = borrow_global_mut<Tontine>(tontine_addr).assets;
    let depositor_assets = simple_map::get(assets, depositor);
    vector::push(depositor_assets.tokens, token);
}
```

In this approach the `Tontine` would be stored on the account of the creator.

The obvious problem with this approach is you have to have a specific field and corresponding deposit / withdraw functions in `Assets` for each type of asset. This is a lot of mostly repeated code, and it means you can't work with assets that you didn't explicitly allow.

Note: There is a consideration with tokens regarding whether you store the TokenId. If you do, you can read that and then use that to do table reads. If not, you'll need to use an indexer to see what tokens a user contributed.

### Store any assets
**Update**: Turns out that `Any` values must be `drop`, which coins and tokens aren't, so this is obviously a non starter.

This is some pseudo-code demonstrating how this would work:
```move
struct Tontine {
    assets: SimpleMap<addr, vector<Any>>
}

public entry fun deposit(depositor: &addr, tontine_addr: addr, item: Any) {
    let assets = borrow_global_mut<Tontine>(tontine_addr).assets;
    let depositor_assets = simple_map::get(assets, depositor);
    vector::push(depositor_assets, item);
}
```

In this approach the `Tontine` would be stored on the account of the creator.

This makes the deposit flow very simple, but on the withdraw side, the withdrawer ends up with a `vector<Any>`. We'd then have to have a fancy function for converting those `Any` values back into their real types. If you allowed users to deposit truly anything, then this function would have to cover how you deposit every single type on Aptos back into an account (e.g. `coin::deposit`, `token::deposit`, etc).

### Resource account vs creator account
For the above options, there is further the decision to store the assets on the creator's account or in a resource account. For the basic functionality there isn't a concrete reason to use a resource account, besides helping with clarity.

If the pool was in a resource account, if the user wanted they could send additional assets to the pool after the tontine was created. This isn't possible if the pool is on the creator account unless specific functions are provided. Saying that, only if the signer cap is transferred to the last member standing could they retrieve these additional assets, since the creator module would have no knowledge of those additional assets.

## Helpful test commands

Create tontine:
```
aptos move run --assume-yes --function-id 0xb078d693856a65401d492f99ca0d6a29a0c5c0e371bc2521570a86e40d95f823::tontine07::create --args string:"Flying Hellfish" 'vector<address>:0x6286dfd5e2778ec069d5906cd774efdba93ab2bec71550fa69363482fbd814e7' u64:2592000 u64:2592000 u64:10000000 u8:1
```

Contribute:
```
aptos move run --assume-yes --function-id 0xb078d693856a65401d492f99ca0d6a29a0c5c0e371bc2521570a86e40d95f823::tontine07::contribute --args address:0xfb27827aee56a8d26c04909deb8d5d3fe61bafcab697c7c585979131bd7b7723 --args u64:100000
```

## Generating schema
```
aptos move generate-schema --named-addresses addr=0x3 --schema-path ../frontend/src/generated
```
