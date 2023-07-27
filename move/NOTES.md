## Reading pixels with a view function
I experimented with a function like this:
```
#[view]
public fun read_pixels(canvas: Object<Canvas>): vector<Color> acquires Canvas {
    let canvas_ = borrow_global_mut<Canvas>(object::object_address(&canvas));
    let pixels = vector::empty();
    let i = 0;
    while (i < (canvas_.config.width * canvas_.config.height)) {
        let color = if (smart_table::contains(&canvas_.pixels, i)) {
            smart_table::remove(&mut canvas_.pixels, i)
        } else {
            canvas_.config.default_color
        };
        vector::push_back(&mut pixels, color);
        i = i + 1;
    };
    pixels
}
```

Unfortunately it would time out with EXECUTION_LIMIT_REACHED. So with a smart data structure, it's probably better to use an indexer instead. Reading in chunks via a view function could work but it'd be slow and unwieldy.
