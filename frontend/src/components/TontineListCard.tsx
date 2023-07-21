import {
  Box,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import { TontineMembership } from "../api/hooks/useGetTontineMembership";
import { getShortAddress } from "../utils";
import { useGetAccountResource } from "../api/hooks/useGetAccountResource";
import { getModuleId, useGlobalState } from "../GlobalState";
import { SelectableTooltip } from "./SelectableTooltip";

export function TontineListCard({
  tontine,
  active,
}: {
  tontine: TontineMembership;
  active: boolean;
}) {
  const [state, _] = useGlobalState();
  const colorMode = useColorMode();

  const moduleId = getModuleId(state);

  const { isLoading, accountResource, error } = useGetAccountResource(
    tontine.tontine_address,
    `${moduleId}::Tontine`,
  );

  const selectedColor = colorMode.colorMode === "dark" ? "#172131" : "gray.300";
  const borderColor = colorMode.colorMode === "dark" ? "gray.400" : "gray.500";

  var title = "Loading...";
  if (error) {
    title = `Error fetching tontine: ${error}`;
  } else if (accountResource) {
    title = (accountResource.data as any).config.description;
  }

  return (
    <Box p={3} key={tontine.tontine_address}>
      <Card
        bg={active ? selectedColor : undefined}
        borderWidth="1px"
        borderColor={active ? borderColor : "transparent"}
      >
        <CardHeader paddingBottom={0}>
          <Heading size="md">{title}</Heading>
        </CardHeader>
        <CardBody>
          <Text as="span">{"Address: "}</Text>
          <SelectableTooltip
            textComponent={
              <Text as="span">{getShortAddress(tontine.tontine_address)}</Text>
            }
            label={tontine.tontine_address}
          />
        </CardBody>
      </Card>
    </Box>
  );
}
