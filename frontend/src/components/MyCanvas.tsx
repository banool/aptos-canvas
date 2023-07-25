import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  _0x3__canvas_token__Canvas,
  _0x3__canvas_token__Color,
} from "../canvas/generated/types";
import {
  Box,
  Button,
  Center,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  VStack,
  useDisclosure,
  useToast,
  Text,
  Spinner,
  PopoverTrigger,
} from "@chakra-ui/react";
import { getModuleId, useGlobalState } from "../GlobalState";
import { useParams } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { HexColorPicker } from "react-colorful";
import { draw } from "../api/transactions";

export const MyCanvas = ({
  canvasData,
  writeable,
  canvasVh = 88,
}: {
  canvasData: _0x3__canvas_token__Canvas;
  writeable: boolean;
  canvasVh?: number;
}) => {
  const pixelSize = 0.96;
  const marginColor = "white";
  const initialScaleOffset = 0.92;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);

  const [pixels, setPixels] = useState(canvasData.pixels);

  // Make sure we update the pixels when the canvasData changes.
  useEffect(() => {
    setPixels(canvasData.pixels);
  }, [canvasData.pixels]);

  const parentRef = useRef<HTMLDivElement>(null);

  // Store scale and pan in state
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [initialScale, setInitialScale] = useState<number | undefined>(
    undefined,
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Where we show the color picker popover.
  const [popoverPos, setPopoverPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const { isOpen, onOpen, onToggle, onClose } = useDisclosure();
  const [popoverCanBeClosed, setPopoverCanBeClosed] = useState(true);

  // Tracking what square we'll submit a transaction for.
  const [squareToDraw, setSquareToDraw] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  // Stuff for submitting txns.
  const toast = useToast();

  const [state] = useGlobalState();
  const moduleId = getModuleId(state);

  const address = useParams().address!;

  const { connected, signAndSubmitTransaction } = useWallet();

  const [colorToSubmit, setColorToSubmit] = useState(marginColor);

  const getOffsets = useCallback(() => {
    const parent = parentRef.current;
    if (!parent || scale === undefined) return;
    const x = (parent.clientWidth / scale - canvasData.config.width) / 2;
    const y = (parent.clientHeight / scale - canvasData.config.height) / 2;
    return { x, y };
  }, [canvasData.config.height, canvasData.config.width, scale]);

  useEffect(() => {
    const parent = parentRef.current;

    if (!parent) return;

    // Determine the scaling factor based on the parent.
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    const scaleX = parentWidth / canvasData.config.width;
    const scaleY = parentHeight / canvasData.config.height;

    // Use the smaller scale factor to ensure the canvas fits within the parent without stretching
    let s = Math.min(scaleX, scaleY) * initialScaleOffset;
    setInitialScale(s);
    setScale(s);
  }, [canvasData.config.height, canvasData.config.width, parentRef]);

  // This one uses the native DOM API WheelEvent, not the React synthetic event.
  // https://stackoverflow.com/a/67258046/3846032
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (scale === undefined) return;

      e.stopPropagation();
      e.preventDefault();

      let newScale = scale;
      newScale *= e.deltaY > 0 ? 0.9 : 1.1;
      setScale(newScale);
    },
    [scale],
  );

  useEffect(() => {
    const parent = parentRef.current;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const context = canvas?.getContext("2d");
    const overlayContext = overlay?.getContext("2d");

    if (
      !canvas ||
      !context ||
      !overlay ||
      !overlayContext ||
      !parent ||
      scale === undefined
    )
      return;

    // https://stackoverflow.com/a/67258046/3846032
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    // Increase the physical size of the canvas to fill the parent.
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
    overlay.width = parent.clientWidth;
    overlay.height = parent.clientHeight;

    // Calculate offsets for centering the art.
    const offsets = getOffsets()!;

    // Decrease the scale at which things are drawn
    context.save();
    context.translate(pan.x, pan.y);
    context.scale(scale, scale);
    overlayContext.save();
    overlayContext.translate(pan.x, pan.y);
    overlayContext.scale(scale, scale);

    // Decide how much of a margin should appear between square.
    const margin = 1 - pixelSize;

    pixels.forEach((color, index) => {
      const x = (index % canvasData.config.width) + offsets.x;
      const y = Math.floor(index / canvasData.config.width) + offsets.y;

      // Draw underneath the squares so a margin appears.
      context.fillStyle = marginColor;
      context.fillRect(x, y, pixelSize + margin, pixelSize + margin);

      // Draw the squares.
      context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.fillRect(
        x + margin, // Shift the pixel to the right by the margin
        y + margin, // Shift the pixel down by the margin
        pixelSize, // Reduce the pixel's width by the margin
        pixelSize, // Reduce the pixel's height by the margin
      );

      return () => {
        if (canvas) {
          canvas.removeEventListener("wheel", handleWheel);
        }
      };
    });

    context.restore();
  }, [canvasData, parentRef, scale, pan, pixels, getOffsets, handleWheel]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const parent = parentRef.current;
    const overlay = overlayRef.current;
    const overlayContext = overlay?.getContext("2d");
    if (!overlay || !overlayContext || !parent || scale === undefined) return;

    const offsets = getOffsets()!;

    const rectSize = 1.5;

    // Clear the previous overlay cursor element. Note, there is a bug with this where
    // it doesn't clear the cursor element if it is on the left or top edge of the canvas.
    overlayContext.clearRect(0, 0, overlay.width, overlay.height);

    if (dragging) {
      const newPan = {
        x: pan.x + (e.clientX - lastMousePos.x),
        y: pan.y + (e.clientY - lastMousePos.y),
      };
      setPan(newPan);
      setLastMousePos({ x: e.clientX, y: e.clientY });
    } else {
      // Adjust for scale and pan
      const rect = overlay.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
      const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

      // Return if the cursor is outside the canvas.
      if (
        !(
          x >= 0 &&
          y >= 0 &&
          x < canvasData.config.width &&
          y < canvasData.config.height
        )
      ) {
        return;
      }

      // Draw a multi colored rectangle around the hovered square.
      const strokes = [
        { lineWidth: 0.4, color: "green" },
        { lineWidth: 0.3, color: "blue" },
        { lineWidth: 0.2, color: "red" },
        { lineWidth: 0.1, color: "yellow" },
      ];

      strokes.forEach((stroke) => {
        overlayContext.lineWidth = stroke.lineWidth;
        overlayContext.strokeStyle = stroke.color;
        overlayContext.strokeRect(
          x + offsets.x + 0.5 - rectSize / 2 - stroke.lineWidth / 2,
          y + offsets.y + 0.5 - rectSize / 2 - stroke.lineWidth / 2,
          rectSize + stroke.lineWidth,
          rectSize + stroke.lineWidth,
        );
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // TODO: Somehow make this trigger only on a stationary click, not after a drag.
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const parent = parentRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !parent || scale === undefined) return;

    // Calculate offsets for centering the art.
    const offsets = getOffsets()!;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
    const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

    // Quit out here if the click is outside the canvas.
    if (
      !(
        x >= 0 &&
        y >= 0 &&
        x < canvasData.config.width &&
        y < canvasData.config.height
      )
    ) {
      return;
    }

    setPopoverPos({ left: e.clientX - rect.left, top: e.clientY - rect.top });
    onToggle();
    setSquareToDraw({ x, y });
  };

  const zoomIn = () => {
    setScale((scale) => scale! * 1.2);
  };

  const zoomOut = () => {
    setScale((scale) => scale! * 0.8);
  };

  const resetTransform = () => {
    setScale(initialScale);
    setPan({ x: 0, y: 0 });
    setLastMousePos({ x: 0, y: 0 });
  };

  const onSubmitDraw = async () => {
    setPopoverCanBeClosed(false);

    try {
      const out = hexToRgb(colorToSubmit);
      if (out === null) {
        throw `Failed to parse color: ${colorToSubmit}`;
      }
      const { r, g, b } = out;
      await draw(
        signAndSubmitTransaction,
        moduleId,
        state.network_value,
        address,
        squareToDraw.x,
        squareToDraw.y,
        r,
        g,
        b,
      );
      toast({
        title: "Success!",
        description: "Successfully drew pixel!!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (e) {
      toast({
        title: "Failure",
        description: `Failed to draw pixel: ${e}`,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
      setColorToSubmit(marginColor);
      // On failure, reset the color of the square.
      resetSquare(squareToDraw.x, squareToDraw.y);
    } finally {
      setPopoverCanBeClosed(true);
      onClose();
    }
  };

  const onChangeColorPicker = (color: string) => {
    // Set squareToDraw to this color. If subjmitting fails or is cancelled out we undo
    // this local modification.
    setSquare(squareToDraw.x, squareToDraw.y, color);
    setColorToSubmit(color);
  };

  const setSquare = (x: number, y: number, color: string) => {
    const newPixels = [...pixels];
    const pixelIndex =
      squareToDraw.y * canvasData.config.width + squareToDraw.x;
    const destructured = hexToRgb(color);
    if (destructured === null) {
      return;
    }
    const { r, g, b } = destructured;
    newPixels[pixelIndex] = { r, g, b };
    setPixels(newPixels);
  };

  const resetSquare = (x: number, y: number) => {
    const newPixels = [...pixels];
    const pixelIndex = y * canvasData.config.width + x;
    newPixels[pixelIndex] = canvasData.pixels[pixelIndex];
    setPixels(newPixels);
  };

  // Rather than setting the position of the Popover explicitly, we set the position of
  // a Box and make the Popover attach to that. This way the Popover arrow works and it
  // has the freedom to choose where it puts itself (so it doesn't overflow outside the
  // edge of the screen).
  return (
    <Center>
      <Box
        borderWidth="1px"
        w="95vw"
        h={`${canvasVh}vh`}
        ref={parentRef}
        position="relative"
      >
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", cursor: "pointer" }}
          width={canvasData.config.width * (scale ?? 0)}
          height={canvasData.config.height * (scale ?? 0)}
          onClick={writeable ? handleClick : undefined}
          onMouseMove={writeable ? handleMouseMove : undefined}
          onMouseDown={writeable ? handleMouseDown : undefined}
          onMouseUp={writeable ? handleMouseUp : undefined}
        />
        <canvas
          ref={overlayRef}
          style={{ position: "absolute", pointerEvents: "none" }}
          width={canvasData.config.width * (scale ?? 0)}
          height={canvasData.config.height * (scale ?? 0)}
        />
        {writeable && (
          <div style={{ position: "absolute", bottom: 20, right: 20 }}>
            <VStack spacing={3}>
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
          </div>
        )}
        <Popover
          isOpen={writeable && isOpen}
          onOpen={onOpen}
          onClose={() => {
            onClose();
            setPopoverPos({ left: 0, top: 0 });
            resetSquare(squareToDraw.x, squareToDraw.y);
          }}
          closeOnBlur={popoverCanBeClosed}
          closeOnEsc={popoverCanBeClosed}
        >
          <PopoverTrigger>
            <Box
              w={0}
              h={1}
              style={{
                left: `${popoverPos.left}px`,
                top: `${popoverPos.top}px`,
                position: "absolute",
                pointerEvents: "none",
              }}
              zIndex={"10"}
            />
          </PopoverTrigger>
          {isOpen && (
            <PopoverContent>
              <PopoverHeader>Make your beautiful mark!!</PopoverHeader>
              <PopoverCloseButton />
              <PopoverArrow />
              <PopoverBody>
                {connected ? (
                  <>
                    <HexColorPicker
                      color={colorToSubmit}
                      onChange={onChangeColorPicker}
                    />
                    <Button
                      mt={2}
                      onClick={onSubmitDraw}
                      isDisabled={hexToRgb(colorToSubmit) === null}
                    >
                      {popoverCanBeClosed ? `Draw` : <Spinner />}
                    </Button>
                  </>
                ) : (
                  <Text>Connect your wallet to draw.</Text>
                )}
              </PopoverBody>
            </PopoverContent>
          )}
        </Popover>
      </Box>
    </Center>
  );
};

function hexToRgb(hex: string) {
  console.log("Hex color: ", hex);
  if (hex.includes("Nan")) {
    return null;
  }
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
