import React, { useState } from "react";

const DRAW_SIZE = 3;

export default function DrawingCanvas({
  drawingRef,
  squaresToDraw,
  setSquaresToDraw,
  displayCanvasWidth,
  displayCanvasHeight,
  offsets,
  scale,
  pan,
}: {
  drawingRef: any;
  squaresToDraw: { x: number; y: number }[];
  setSquaresToDraw: (squares: { x: number; y: number }[]) => void;
  displayCanvasWidth: number;
  displayCanvasHeight: number;
  offsets: { x: number; y: number };
  scale: number | undefined;
  pan: { x: number; y: number };
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [prevSquare, setPrevSquare] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Simple linear interpolation between two points
  function interpolate(x1: number, y1: number, x2: number, y2: number) {
    const points = [];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const stepCount = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx / stepCount;
    const stepY = dy / stepCount;

    for (let i = 0; i < stepCount; i++) {
      points.push({
        x: x1 + i * stepX,
        y: y1 + i * stepY,
      });
    }

    return points;
  }

  const handleMouseMoveDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const drawing = drawingRef.current;
    const drawingContext = drawing?.getContext("2d");
    if (!drawing || !drawingContext || scale === undefined) return;

    if (!isDrawing) return;

    const rect = drawing.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left - pan.x) / scale - offsets.x);
    const y = Math.floor((e.clientY - rect.top - pan.y) / scale - offsets.y);

    const newSquares = [{ x, y }];
    if (prevSquare) {
      // fill in the squares in between of the current mouse location and the previous mouse location
      const squaresInBetween = interpolate(prevSquare.x, prevSquare.y, x, y);
      newSquares.push(...squaresInBetween);
    }

    setSquaresToDraw([...squaresToDraw, ...newSquares]);
    setPrevSquare({ x, y });
  };

  const handleMouseDownDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
  };

  const handleMouseUpDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(false);
    setPrevSquare(null);
  };

  return (
    <canvas
      ref={drawingRef}
      style={{ position: "absolute", cursor: "pointer" }}
      width={displayCanvasWidth}
      height={displayCanvasHeight}
      onMouseMove={handleMouseMoveDrawing}
      onMouseDown={handleMouseDownDrawing}
      onMouseUp={handleMouseUpDrawing}
    />
  );
}
