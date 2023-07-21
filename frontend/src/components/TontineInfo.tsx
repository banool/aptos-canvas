import { Box, Text, Heading } from "@chakra-ui/react";
import { getModuleId, useGlobalState } from "../GlobalState";
import { simpleMapArrayToMap } from "../utils";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetAccountResources } from "../api/hooks/useGetAccountResources";
import { useGetMemberStatuses } from "../api/hooks/useGetMemberStatuses";
import { useGetOverallStatus } from "../api/hooks/useGetOverallStatus";
import { MemberInfoTable } from "./MemberInfoTable";
import { ConfigTable } from "./ConfigTable";
import { ActiveTontine } from "../pages/HomePage";
import { InviteMemberButton } from "./InviteMemberButton";
import { _0x3__tontine07__Tontine } from "../generated/types";

export function TontineInfo({
  activeTontine,
  showRaw,
}: {
  activeTontine: ActiveTontine;
  showRaw: boolean;
}) {
  const [state, _] = useGlobalState();

  const { account } = useWallet();

  const moduleId = getModuleId(state);

  const { data, error, isLoading } = useGetAccountResources(
    activeTontine.address,
  );

  const tontineResource = data?.find(
    (resource) => resource.type === `${moduleId}::Tontine`,
  );

  const objectResource = data?.find(
    (resource) => resource.type === "0x1::object::ObjectCore",
  );

  const resourcesFound =
    tontineResource !== undefined && objectResource !== undefined;

  const tontineData: _0x3__tontine07__Tontine  = tontineResource?.data as any;
  const objectData = objectResource?.data as any;

  const creatorAddress = objectData?.owner;

  const {
    isLoading: memberStatusesIsLoading,
    data: memberStatusesRaw,
    error: memberStatusesError,
  } = useGetMemberStatuses(activeTontine.address, {
    additionalQueryCriteria: tontineResource,
  });

  const {
    isLoading: overallStatusIsLoading,
    data: overallStatusRaw,
    error: overallStatusError,
  } = useGetOverallStatus(activeTontine.address, {
    additionalQueryCriteria: tontineResource,
  });
  const overallStatus: number | undefined = overallStatusRaw;

  const memberStatusesData = memberStatusesRaw?.data
    ? simpleMapArrayToMap(memberStatusesRaw.data)
    : undefined;

  const isLocked = parseInt(tontineData?.locked_time_secs) > 0;

  var body;
  if (isLoading) {
    body = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text>Loading...</Text>
      </Box>
    );
  } else if (error !== null) {
    body = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text>{`Error loading tontine information: ${error}`}</Text>
      </Box>
    );
  } else if (!resourcesFound) {
    body = (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text>A valid tontine could not be found at this address.</Text>
      </Box>
    );
  } else if (showRaw) {
    body = (
      <Text>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </Text>
    );
  } else {
    body = (
      <Box p={5}>
        <Heading size="md">Member Info</Heading>
        <Box p={6} paddingLeft={3} paddingRight={3}>
          <MemberInfoTable
            tontineData={tontineData}
            activeTontine={activeTontine}
            overallStatus={overallStatus}
            memberStatusesData={memberStatusesData}
            isLocked={isLocked}
            userAddress={account?.address}
            creatorAddress={creatorAddress!}
          />
          {isLocked ? null : (
            <Box p={5}>
              <InviteMemberButton activeTontine={activeTontine} />
            </Box>
          )}
        </Box>
        <Heading size="md">Config</Heading>
        <Box p={6} paddingLeft={3} paddingRight={3}>
          <ConfigTable
            tontineData={tontineData}
            objectData={objectData}
            activeTontine={activeTontine}
            overallStatus={overallStatus}
            memberStatusesData={memberStatusesData}
            isLocked={isLocked}
            userAddress={account?.address}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box paddingLeft={3} paddingRight={3}>
      {body}
    </Box>
  );
}
