import { Text, Table, Tr, Th, Tbody, Td, Tooltip } from "@chakra-ui/react";
import { getDurationPretty, getShortAddress, octaToAptNormal } from "../utils";
import { useGetAnsNames } from "../api/hooks/useGetAnsName";
import { getFallbackPolicyText } from "../constants";
import { SelectableTooltip } from "./SelectableTooltip";
import { ActiveTontine } from "../pages/HomePage";
import { _0x3__tontine07__Tontine, _0x1__object__ObjectCore } from "../generated/types";

export function ConfigTable({
  tontineData,
  objectData,
  activeTontine,
  overallStatus,
  memberStatusesData,
  isLocked,
  userAddress,
}: {
  tontineData: _0x3__tontine07__Tontine;
  objectData: _0x1__object__ObjectCore;
  activeTontine: ActiveTontine;
  overallStatus: number | undefined;
  memberStatusesData: Map<string, number> | undefined;
  isLocked: boolean;
  userAddress: string | undefined;
}) {
  const creatorAddress = objectData.owner;
  const { data: names } = useGetAnsNames([creatorAddress]);
  const ansLookup = names?.find((lookup) => lookup.address === creatorAddress);
  var text;
  var label;
  if (ansLookup?.name) {
    text = `${ansLookup.name}.apt`;
    label = creatorAddress;
  } else {
    text = getShortAddress(creatorAddress);
    label = creatorAddress;
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const delegationPoolAddress = tontineData.config.delegation_pool;

  return (
    <Table variant="simple">
      <Tbody>
        <Tr>
          <Th>
            <Text>
              {"Tontine address "}
              <sup>
                <Tooltip label="The address of the object containing the tontine">
                  ⓘ
                </Tooltip>
              </sup>
            </Text>
          </Th>
          <Td>
            <SelectableTooltip
              textComponent={
                <Text>{getShortAddress(activeTontine.address)}</Text>
              }
              label={activeTontine.address}
            />
          </Td>
        </Tr>
        <Tr>
          <Th>Description</Th>
          <Td>{tontineData.config.description}</Td>
        </Tr>
        <Tr>
          <Th>Creator</Th>
          <Td>
            <SelectableTooltip
              textComponent={<Text>{text}</Text>}
              label={label}
            />
          </Td>
        </Tr>
        <Tr>
          <Th>Required contribution per member</Th>
          <Td>{`${octaToAptNormal(
            Number(tontineData.config.per_member_amount_octa),
          )} APT`}</Td>
        </Tr>
        <Tr>
          <Th>Required check in frequency</Th>
          <Td>
            <Tooltip
              label={`Every ${tontineData.config.check_in_frequency_secs} seconds`}
            >{`Every ${getDurationPretty(
              Number(tontineData.config.check_in_frequency_secs),
            )}`}</Tooltip>
          </Td>
        </Tr>
        <Tr>
          <Th>
            <Text>
              {"Claim window "}
              <sup>
                <Tooltip label="Once only one member remains, this is how long they have to claim the funds.">
                  ⓘ
                </Tooltip>
              </sup>
            </Text>
          </Th>
          <Td>
            <Tooltip
              label={`${tontineData.config.claim_window_secs} seconds`}
            >{`${getDurationPretty(
              Number(tontineData.config.claim_window_secs),
            )}`}</Tooltip>
          </Td>
        </Tr>

        <Tr>
          <Th>
            {"Fallback Policy "}
            <sup>
              <Tooltip
                label={"This is what happens if no one claims the funds."}
              >
                ⓘ
              </Tooltip>
            </sup>
          </Th>
          <Td>
            {getFallbackPolicyText(tontineData.config.fallback_policy.policy)}
          </Td>
        </Tr>
        <Tr>
          <Th>
            <Text>
              {"Created at "}
              <sup>
                <Tooltip label={`Using timezone ${tz}`}>ⓘ</Tooltip>
              </sup>
            </Text>
          </Th>
          <Td>
            {new Date(Number(tontineData.creation_time_secs) * 1000).toLocaleString()}
          </Td>
        </Tr>
        <Tr>
          <Th>
            <Text>
              {"Locked at "}
              <sup>
                <Tooltip label={`Using timezone ${tz}`}>ⓘ</Tooltip>
              </sup>
            </Text>
          </Th>
          <Td>
            {Number(tontineData.locked_time_secs) > 0
              ? new Date(Number(tontineData.locked_time_secs) * 1000).toLocaleString()
              : "Not locked yet"}
          </Td>
        </Tr>
        <Tr>
          <Th>
            <Text>
              {"Funds claimed at "}
              <sup>
                <Tooltip label={`Using timezone ${tz}`}>ⓘ</Tooltip>
              </sup>
            </Text>
          </Th>
          <Td>
            {Number(tontineData.funds_claimed_secs) > 0
              ? new Date(Number(tontineData.funds_claimed_secs) * 1000).toLocaleString()
              : "Funds not claimed yet"}
          </Td>
        </Tr>
        <Tr>
          <Th>
            <Text>{"Delegation pool "}</Text>
          </Th>
          <Td>
            {delegationPoolAddress ? (
              <SelectableTooltip
                textComponent={
                  <Text>{getShortAddress(delegationPoolAddress)}</Text>
                }
                label={delegationPoolAddress}
              />
            ) : (
              "N/A"
            )}
          </Td>
        </Tr>
      </Tbody>
    </Table>
  );
}
