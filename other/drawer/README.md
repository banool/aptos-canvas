# Drawer

This script lets you draw quickly to a canvas. To use it, do the following:

1. Get an image in bmp format of the same dimensions as the canvas.
2. Update tokenAddress to point to the token you want to draw to.
3. Update loadImage to load the correct bmp.

If the module address changes, update it in drawPoint.

Make sure the bmp is bmp3:
```
mogrify -format bmp -define bmp:format=bmp4 hokusai.bmp
```

See more on that issue: https://github.com/shaozilee/bmp-js/issues/16#issuecomment-418509274.
