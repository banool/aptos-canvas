import { Button, VStack } from "@chakra-ui/react";

export default function ZoomButtons({
  zoomIn,
  zoomOut,
  resetTransform,
}: {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}) {
  return (
    <div style={{ position: "absolute", bottom: 20, right: 20 }}>
      <VStack spacing={3}>
        <Button colorScheme="cyan" title="Zoom in" onClick={() => zoomIn()}>
          +
        </Button>
        <Button colorScheme="cyan" title="Zoom out" onClick={() => zoomOut()}>
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
  );
}
