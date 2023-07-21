import { Box, CloseButton, Flex, Spacer, Switch, Text } from "@chakra-ui/react";
import { PrimaryActions } from "./PrimaryActions";
import { TontineInfo } from "./TontineInfo";
import { ActiveTontine } from "../pages/HomePage";
import { useState } from "react";

export function TontineDisplay({
  activeTontine,
  setActiveTontine,
}: {
  activeTontine: ActiveTontine;
  setActiveTontine: (tontine: ActiveTontine | null) => void;
}) {
  const [showRaw, setShowRaw] = useState(false);

  return (
    <Box>
      <Box>
        <Flex alignItems="center">
          <PrimaryActions
            activeTontine={activeTontine}
            setActiveTontine={setActiveTontine}
          />
          <Spacer />
          <Flex marginRight={4} alignItems="center">
            <Text paddingEnd={2}>Raw</Text>
            <Switch
              size="lg"
              colorScheme="blue"
              isChecked={showRaw}
              onChange={() => setShowRaw((before) => !before)}
            />
          </Flex>
          <Box paddingRight={5}>
            <CloseButton
              size="md"
              bg="red.500"
              onClick={() => setActiveTontine(null)}
            />
          </Box>
        </Flex>
      </Box>
      <Box p={3}>
        <TontineInfo activeTontine={activeTontine} showRaw={showRaw} />
      </Box>
    </Box>
  );
}
