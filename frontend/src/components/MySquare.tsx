import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Box,
  useDisclosure,
  Text,
  PopoverHeader,
  PopoverCloseButton,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { HexColorPicker } from "react-colorful";
import { _0x3__canvas_token__Color } from "../canvas/generated/types";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { draw } from "../api/transactions";
import { getModuleId, useGlobalState } from "../GlobalState";
import { useParams } from "react-router-dom";

export const MySquare = ({
  color,
  sizeViewportStr,
  x,
  y,
  writeable,
}: {
  color: _0x3__canvas_token__Color;
  sizeViewportStr: string;
  x: number;
  y: number;
  writeable: boolean;
}) => {
  const bg = `rgb(${color.r},${color.g},${color.b})`;

  const toast = useToast();

  const [state] = useGlobalState();
  const moduleId = getModuleId(state);

  const address = useParams().address!;

  const { connected, signAndSubmitTransaction } = useWallet();

  const [colorToSubmit, setColorToSubmit] = useState(bg);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [popoverCanBeClosed, setPopoverCanBeClosed] = useState(true);

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
        x,
        y,
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
      setColorToSubmit(bg);
    } finally {
      setPopoverCanBeClosed(true);
      onClose();
    }
  };

  return (
    <Popover
      isOpen={writeable && isOpen}
      onOpen={onOpen}
      onClose={onClose}
      closeOnBlur={popoverCanBeClosed}
      closeOnEsc={popoverCanBeClosed}
    >
      <PopoverTrigger>
        <Box
          bg={colorToSubmit}
          w={sizeViewportStr}
          h={sizeViewportStr}
          _hover={
            writeable
              ? {
                  cursor: "pointer",
                  borderWidth: "1px",
                  boxShadow: "0 0 0 1px red, 0 0 0 3px blue, 0 0 0 5px green",
                  zIndex: "10",
                }
              : undefined
          }
          borderWidth={"0.5px"}
          borderColor={"#EBEBEB"}
        />
      </PopoverTrigger>
      {isOpen && (
        <PopoverContent zIndex={"10"}>
          <PopoverHeader>Make your beautiful mark!!</PopoverHeader>
          <PopoverCloseButton />
          <PopoverArrow />
          <PopoverBody>
            {connected ? (
              <>
                <HexColorPicker
                  color={colorToSubmit}
                  onChange={setColorToSubmit}
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
