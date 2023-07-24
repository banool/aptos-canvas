import { Box } from "@chakra-ui/react";
import { _0x3__canvas_token__Color } from "../canvas/generated/types";

export const MySquare = ({
  color,
  sizeViewportStr,
}: {
  color: _0x3__canvas_token__Color;
  sizeViewportStr: string;
}) => {
  const updateSquare = () => {};

  const bg = `rgb(${color.r},${color.g},${color.b})`;
  console.log();

  return (
    <Box
      bg={bg}
      w={sizeViewportStr}
      h={sizeViewportStr}
      onClick={() => updateSquare()}
      borderWidth={"0.5px"}
      borderColor={"#EBEBEB"}
    />
  );
};
