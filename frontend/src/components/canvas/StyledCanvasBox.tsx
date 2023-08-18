import React from "react";
import { Box } from "@chakra-ui/react";
import { HEADER_HEIGHT } from "../header/Header";
import { Canvas } from "../../canvas/generated/types";

function getCanvasRatio(canvasData: Canvas) {
  if (
    !canvasData ||
    !canvasData.config ||
    !canvasData.config.width ||
    !canvasData.config.height
  ) {
    return 1.5;
  }

  const canvasWidth = parseInt(canvasData.config.width);
  const canvasHeight = parseInt(canvasData.config.height);
  return canvasWidth / canvasHeight;
}

export const StyledCanvasBox = ({
  children,
  canvasData,
}: {
  children: React.ReactNode;
  canvasData: Canvas;
}) => {
  const canvasRatio = getCanvasRatio(canvasData);

  return (
    <Box
      display="flex"
      paddingBottom={8}
      paddingLeft={8}
      paddingRight={8}
      height={`calc(100vh - ${HEADER_HEIGHT}px)`}
      width={`calc((100vh - ${HEADER_HEIGHT}px) * ${canvasRatio})`}
    >
      {children}
    </Box>
  );
};
