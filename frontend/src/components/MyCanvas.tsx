import React, { useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  Box,
  Button,
  Center,
  Flex,
  SimpleGrid,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  _0x3__canvas_token__Canvas,
  _0x3__canvas_token__Color,
} from "../canvas/generated/types";
import { MySquare } from "./MySquare";

export const MyCanvas = ({
  canvasData,
  writeable,
  canvasVh = 88,
}: {
  canvasData: _0x3__canvas_token__Canvas;
  writeable: boolean;
  canvasVh?: number;
}) => {
  // To determine the size of each pixel we do the following.
  // 1. Get canvas height.
  // 2. Get the size of a pixel as a percentage of the total canvas size.
  // 3. Multiply that by the vh we're using for the canvas.
  // This then gets used as both width and height of the pixels.
  const shortestEdge = canvasData.config.height;
  const sizePercent = 1 / shortestEdge;
  const sizeViewport = sizePercent * canvasVh;
  const sizeViewportStr = `${sizeViewport}vh`;

  return (
    <TransformWrapper
      limitToBounds={false}
      initialPositionX={canvasData.config.width / 2}
      initialPositionY={canvasData.config.height / 2}
      initialScale={0.95}
      minScale={0.1}
      maxScale={10}
      centerOnInit={true}
    >
      {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
        <React.Fragment>
          <Center>
            <Box position="relative" borderWidth={1}>
              {writeable && (
                <VStack
                  position="absolute"
                  bottom="5"
                  right="10"
                  zIndex="100"
                  spacing={3}
                >
                  <Button
                    colorScheme="cyan"
                    title="Zoom in"
                    onClick={() => zoomIn()}
                  >
                    +
                  </Button>
                  <Button
                    colorScheme="cyan"
                    title="Zoom out"
                    onClick={() => zoomOut()}
                  >
                    -
                  </Button>
                  <Button
                    colorScheme="cyan"
                    title="Reset"
                    onClick={() => resetTransform()}
                  >
                    x
                  </Button>
                </VStack>
              )}
              <TransformComponent>
                <Box h={`${canvasVh}vh`} w={"95vw"}>
                  <Center>
                    <SimpleGrid columns={canvasData.config.width} spacing={0}>
                      {canvasData.pixels.map((color, index) => {
                        return (
                          <MySquare
                            key={index}
                            color={color}
                            sizeViewportStr={sizeViewportStr}
                            x={index % canvasData.config.width}
                            y={Math.floor(index / canvasData.config.width)}
                            writeable={writeable}
                          />
                        );
                      })}
                    </SimpleGrid>
                  </Center>
                </Box>
              </TransformComponent>
            </Box>
          </Center>
        </React.Fragment>
      )}
    </TransformWrapper>
  );
};
