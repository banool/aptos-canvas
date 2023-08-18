import { Button } from "@chakra-ui/react";
import { EditIcon, CloseIcon } from "@chakra-ui/icons";
import { useDrawMode } from "../../context/DrawModeContext";

const BUTTON_SIZE = 48;

export default function DrawModeToggleButton() {
  const { drawModeOn, setDrawModeOn } = useDrawMode();

  const startDrawMode = () => {
    setDrawModeOn(true);
  };

  const endDrawMode = () => {
    setDrawModeOn(false);
  };

  return (
    <Button
      width={`${BUTTON_SIZE}px`}
      height={`${BUTTON_SIZE}px`}
      borderRadius="50%" // makes it round
      backgroundColor="#4339F2"
      color="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
      onClick={drawModeOn ? endDrawMode : startDrawMode}
      title={drawModeOn ? "Exit draw mode" : "Enter draw mode"}
    >
      {drawModeOn ? <CloseIcon /> : <EditIcon />}
    </Button>
  );
}
