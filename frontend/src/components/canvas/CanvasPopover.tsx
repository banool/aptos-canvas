import {
  Box,
  Button,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  Text,
  Spinner,
  PopoverTrigger,
} from "@chakra-ui/react";
import { HexColorPicker } from "react-colorful";

// Rather than setting the position of the Popover explicitly, we set the position of
// a Box and make the Popover attach to that. This way the Popover arrow works and it
// has the freedom to choose where it puts itself (so it doesn't overflow outside the
// edge of the screen).
export const CanvasPopover = ({
  popoverCanBeClosed,
  isOpen,
  onOpen,
  onPopoverClose,
  popoverPos,
  connected,
  colorToSubmit,
  onSubmitDraw,
  onChangeColorPicker,
}: {
  popoverCanBeClosed: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onPopoverClose: () => void;
  popoverPos: { left: number; top: number };
  connected: boolean;
  colorToSubmit: string;
  onSubmitDraw: () => void;
  onChangeColorPicker: (color: string) => void;
}) => {
  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onPopoverClose}
      closeOnBlur={popoverCanBeClosed}
      closeOnEsc={popoverCanBeClosed}
    >
      <PopoverTrigger>
        <Box
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
