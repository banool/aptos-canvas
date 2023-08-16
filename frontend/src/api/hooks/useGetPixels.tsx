import { useEffect, useState } from "react";
import { REFETCH_INTERVAL_MS } from "../helpers";
import { Color, Token } from "../../canvas/generated/types";
import { useQuery } from "react-query";

export function useGetPixels(tokenData: Token) {
  const [pixels, setPixels] = useState<Color[]>([]);

  const { data: pngData, error: pngError } = useQuery(
    ["canvasPng", tokenData.uri],
    () => fetch(tokenData.uri).then((res) => res.blob()),
    {
      refetchOnWindowFocus: false,
      refetchInterval: REFETCH_INTERVAL_MS,
    },
  );

  // // These pixels get drawn over the top of the canvas after we draw the base layer
  // // using the png. The key is the index.
  // const [pixelsOverride, setPixelsOverride] = useState<Map<number, Color>>(
  //   new Map(),
  // );

  // Make sure we update the pixels when the canvasData changes.
  useEffect(() => {
    pngToPixels(pngData ?? new Blob()).then((pixels) => {
      setPixels(pixels);
    });
  }, [pngData]);

  return pixels;
}

// TODO: It'd be better to just write the PNG to the main canvas directly.
function pngToPixels(pngData: Blob): Promise<Color[]> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(pngData);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx === undefined) {
        resolve([]);
        return;
      }

      canvas.width = image.width;
      canvas.height = image.height;

      ctx!.drawImage(image, 0, 0);
      const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = [];

      for (let i = 0; i < imageData.data.length; i += 4) {
        const color = {
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2],
        };

        pixels.push(color);
      }

      URL.revokeObjectURL(url);
      resolve(pixels); // Resolve the Promise with the pixels array
    };

    image.onerror = (err) => {
      // Reject the Promise if there's an error
      reject(err);
    };

    image.src = url;
  });
}
