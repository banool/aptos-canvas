import React, { useCallback, useEffect, useRef, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Token, Canvas, Color } from "../../canvas/generated/types";
import { Box, Center, useDisclosure, useToast } from "@chakra-ui/react";
import { getModuleId, useGlobalState } from "../../GlobalState";
import { useParams } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { draw } from "../../api/transactions";
import { useGetPixels } from "../../api/hooks/useGetPixels";
import { CanvasPopover } from "./CanvasPopover";
import ZoomButtons from "./ZoomButtons";
import { hexToRgb } from "./helpers";

const PIXEL_SIZE = 0.98; // the width of each pixel in the canvas
const MARGIN_COLOR = "white";
const INITIAL_SCALE_OFFSET = 0.92;

export const MyCanvas = ({
  canvasData,
  tokenData,
  writeable,
  canvasVh = 88,
}: {
  canvasData: Canvas;
  tokenData: Token;
  writeable: boolean;
  canvasVh?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLCanvasElement | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const pixels = useGetPixels(tokenData);

  // These pixels get drawn over the top of the canvas after we draw the base layer
  // using the png. The key is the index.
  const [pixelsOverride, setPixelsOverride] = useState<Map<number, Color>>(
    new Map(),
  );

  // Store scale and pan in state
  const [scale, setScale] = useState<number | undefined>(undefined);
  const [initialScale, setInitialScale] = useState<number | undefined>(
    undefined,
  );
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [lastPan, setLastPan] = useState({ x: 0, y: 0 });
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

  const [colorToSubmit, setColorToSubmit] = useState(MARGIN_COLOR);

  const canvasWidth = parseInt(canvasData.config.width);
  const canvasHeight = parseInt(canvasData.config.height);

  const getOffsets = useCallback(() => {
    const parent = parentRef.current;
    if (!parent || scale === undefined) return;
    const x = (parent.clientWidth / scale - canvasWidth) / 2;
    const y = (parent.clientHeight / scale - canvasHeight) / 2;
    return { x, y };
  }, [canvasHeight, canvasWidth, scale]);

  useEffect(() => {
    const parent = parentRef.current;

    if (!parent) return;

    // Determine the scaling factor based on the parent.
    const parentWidth = parent.clientWidth;
    const parentHeight = parent.clientHeight;

    const scaleX = parentWidth / canvasWidth;
    const scaleY = parentHeight / canvasHeight;

    // Use the smaller scale factor to ensure the canvas fits within the parent without stretching
    let s = Math.min(scaleX, scaleY) * INITIAL_SCALE_OFFSET;
    setInitialScale(s);
    setScale(s);
  }, [canvasHeight, canvasWidth, parentRef]);

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
    const margin = 1 - PIXEL_SIZE;

    pixels.forEach((color, index) => {
      const x = (index % canvasWidth) + offsets.x;
      const y = Math.floor(index / canvasWidth) + offsets.y;

      // Draw underneath the squares so a margin appears.
      context.fillStyle = MARGIN_COLOR;
      context.fillRect(x, y, PIXEL_SIZE + margin, PIXEL_SIZE + margin);

      // Draw the squares.
      context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.fillRect(
        x + margin, // Shift the pixel to the right by the margin
        y + margin, // Shift the pixel down by the margin
        PIXEL_SIZE, // Reduce the pixel's width by the margin
        PIXEL_SIZE, // Reduce the pixel's height by the margin
      );
    });

    // Draw the override pixels on top.
    for (const [index, color] of pixelsOverride) {
      const x = (index % canvasWidth) + offsets.x;
      const y = Math.floor(index / canvasWidth) + offsets.y;

      // Draw underneath the squares so a margin appears.
      context.fillStyle = MARGIN_COLOR;
      context.fillRect(x, y, PIXEL_SIZE + margin, PIXEL_SIZE + margin);

      // Draw the squares.
      context.fillStyle = `rgb(${color.r},${color.g},${color.b})`;
      context.fillRect(
        x + margin, // Shift the pixel to the right by the margin
        y + margin, // Shift the pixel down by the margin
        PIXEL_SIZE, // Reduce the pixel's width by the margin
        PIXEL_SIZE, // Reduce the pixel's height by the margin
      );
    }

    context.restore();

    return () => {
      if (canvas) {
        canvas.removeEventListener("wheel", handleWheel);
      }
    };
  }, [
    canvasData,
    parentRef,
    scale,
    pan,
    pixels,
    pixelsOverride,
    getOffsets,
    handleWheel,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const parent = parentRef.current;
    const overlay = overlayRef.current;
    const overlayContext = overlay?.getContext("2d");
    if (!overlay || !overlayContext || !parent || scale === undefined) return;

    const offsets = getOffsets()!;

    const rectSize = 1.5;

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

      // Clear the previous overlay cursor element.
      // Clear rectangle taking into account the transformations (scale and pan).
      overlayContext.clearRect(
        (-pan.x + offsets.x) / scale,
        (-pan.y + offsets.y) / scale,
        // We clear 1000x wide just for good measure, since I saw with this change that
        // it'd still appear on the far right sometimes.
        (parent.clientWidth / scale) * 1000,
        (parent.clientHeight / scale) * 1000,
      );

      // Return if the cursor is outside the canvas.
      if (!(x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight)) {
        return;
      }

      // Draw a multi colored rectangle around the hovered square.
      const strokes = [
        { lineWidth: 0.4, color: "green" },
        { lineWidth: 0.3, color: "blue" },
        { lineWidth: 0.2, color: "red" },
        { lineWidth: 0.1, color: "yellow" },
      ];

      overlayContext.save();

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

      overlayContext.restore();
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setLastPan(pan);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDragging(false);
    if (pan.x === lastPan.x && pan.y === lastPan.y) {
      // This means the user didn't drag the canvas, they just clicked it. We only want
      // to show the color picker if they click on a square, not drag, so we handle the
      // onClick event here rather than setting onClick on the canvas.
      handleClick(e);
    }
  };

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
    if (!(x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight)) {
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
        duration: 3000,
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
      setColorToSubmit(MARGIN_COLOR);
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
    const pixelIndex = squareToDraw.y * canvasWidth + squareToDraw.x;
    const destructured = hexToRgb(color);
    if (destructured === null) {
      return;
    }
    const { r, g, b } = destructured;
    setPixelsOverride((pixelsOverride) => {
      const newPixelsOverride = new Map(pixelsOverride);
      newPixelsOverride.set(pixelIndex, { r, g, b });
      return newPixelsOverride;
    });
  };

  const getPixelIndex = (x: number, y: number) => {
    return y * canvasWidth + x;
  };

  const resetSquare = (x: number, y: number) => {
    const pixelIndex = getPixelIndex(x, y);
    setPixelsOverride((pixelsOverride) => {
      const newPixelsOverride = new Map(pixelsOverride);
      newPixelsOverride.delete(pixelIndex);
      return newPixelsOverride;
    });
  };

  const handlePopoverClose = () => {
    onClose();
    setPopoverPos({ left: 0, top: 0 });
    resetSquare(squareToDraw.x, squareToDraw.y);
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
          width={canvasWidth * (scale ?? 0)}
          height={canvasHeight * (scale ?? 0)}
          onMouseMove={writeable ? handleMouseMove : undefined}
          onMouseDown={writeable ? handleMouseDown : undefined}
          onMouseUp={writeable ? handleMouseUp : undefined}
        />
        <canvas
          ref={overlayRef}
          style={{ position: "absolute", pointerEvents: "none" }}
          width={canvasWidth * (scale ?? 0)}
          height={canvasHeight * (scale ?? 0)}
        />
        {writeable && (
          <ZoomButtons
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            resetTransform={resetTransform}
          />
        )}
        <CanvasPopover
          popoverCanBeClosed={popoverCanBeClosed}
          writeable={writeable}
          isOpen={isOpen}
          onOpen={onOpen}
          onPopoverClose={handlePopoverClose}
          popoverPos={popoverPos}
          connected={connected}
          colorToSubmit={colorToSubmit}
          onSubmitDraw={onSubmitDraw}
          onChangeColorPicker={onChangeColorPicker}
        />
      </Box>
    </Center>
  );
};
