import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Box, Flex, Text, useToast } from "@chakra-ui/react";
import { TontineList } from "../../components/TontineList";
import { useEffect, useState } from "react";
import { TontineDisplay } from "../../components/TontineDisplay";
import { useGlobalState } from "../../GlobalState";
import { HomeActions } from "../../components/HomeActions";
import { CreateTontine } from "../../components/CreateTontine";
import { Explanation } from "../../components/Explanation";
import { useSearchParams } from "react-router-dom";

export type ActiveTontine = {
  address: string;
};

export const HomePage = () => {
  const { network } = useWallet();
  const [state, _] = useGlobalState();

  // This state tracks which tontine we're actively viewing. The value we store here
  // is the tontine address.
  const [activeTontine, setActiveTontine] = useState<ActiveTontine | null>(
    null,
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [hasSetTontineOnFirstLoad, setHasSetTontineOnFirstLoad] =
    useState(false);

  // This hook manages keeping the tontine and URL state in sync.
  useEffect(() => {
    const params: any = [];
    searchParams.forEach((value, key) => {
      params.push([key, value]);
    });
    if (!hasSetTontineOnFirstLoad) {
      // There is a tontine in the URL and we haven't done the initial load, load up
      // a tontine if possible based on the url.
      setHasSetTontineOnFirstLoad(true);
      const urlTontineAddress = searchParams.get("tontine");
      if (urlTontineAddress === null) {
        // There is no tontine in the URL. Do nothing.
        return;
      }
      // Set the active tontine to the address we have.
      setActiveTontine({ address: urlTontineAddress });
    } else {
      // We've already done the initial load. From this point on we update the URL
      // based on activeTontine and not vice versa.
      if (activeTontine === null) {
        // There is no active tontine, remove the tontine from the URL.
        searchParams.delete("tontine");
        setSearchParams(searchParams);
      } else {
        // There is an active tontine, update the URL.
        searchParams.set("tontine", activeTontine.address);
        setSearchParams(searchParams);
      }
    }
  }, [
    hasSetTontineOnFirstLoad,
    activeTontine,
    setActiveTontine,
    searchParams,
    setSearchParams,
  ]);

  const [showingCreateComponent, setShowingCreateComponent] = useState(false);

  // Don't show the main content if the wallet and site networks mismatch.
  if (
    network &&
    !network.name.toLowerCase().startsWith(state.network_name.toLowerCase())
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Text>
          Your wallet network is {network.name.toLowerCase()} but you've
          selected {state.network_name} in the site, please make sure they
          match.
        </Text>
      </Box>
    );
  }

  // Note: If there are more tontines than fit in a single screen, they overflow
  // beyond the end of the sidebar box downward. I have not been able to fix it yet.
  return (
    <Flex p={3} height="100%" flex="1" overflow="auto">
      <Box width="21%" borderRight="1px">
        <TontineList
          activeTontine={activeTontine}
          setActiveTontine={setActiveTontine}
        />
      </Box>
      <Box width="79%">
        {activeTontine ? (
          <TontineDisplay
            activeTontine={activeTontine}
            setActiveTontine={setActiveTontine}
          />
        ) : (
          <Box>
            <HomeActions
              showingCreateComponent={showingCreateComponent}
              setShowingCreateComponent={setShowingCreateComponent}
              setActiveTontine={setActiveTontine}
            />
            {showingCreateComponent ? <CreateTontine /> : <Explanation />}
          </Box>
        )}
      </Box>
    </Flex>
  );
};
