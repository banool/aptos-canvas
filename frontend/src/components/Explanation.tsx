import {
  Box,
  Center,
  Divider,
  Image,
  Link,
  ListItem,
  Text,
  UnorderedList,
  useColorModeValue,
} from "@chakra-ui/react";
import simpsonsImage from "../images/simpsons_tontine.png";

export const Explanation = () => {
  const linkColor = useColorModeValue("blue.500", "blue.300");
  return (
    <Box
      p={7}
      paddingTop={0}
      display="flex"
      justifyContent="center"
      height="100%"
    >
      <Box>
        <Box
          borderLeftWidth="3px"
          borderLeftColor="blue.500"
          pl={4}
          py={2}
          mt={4}
          fontStyle="italic"
        >
          Works of fiction ... often feature a variant model of the tontine in
          which the capital devolves upon the last surviving nominee, thereby
          dissolving the trust and potentially making the survivor very wealthy.
          It is unclear whether this model ever existed in the real world.
        </Box>
        <Box p={3}>
          &mdash; <i>Tontine</i>,{" "}
          <Link
            color={linkColor}
            href="https://en.wikipedia.org/wiki/Tontine#In_popular_culture"
          >
            Wikipedia
          </Link>
        </Box>
        <Center>
          <Image src={simpsonsImage} maxHeight="320px" alt="Simpsons Tontine" />
        </Center>
        <Box p={3}>
          &mdash;{" "}
          <i>
            Raging Abe Simpson and His Grumbling Grandson in 'The Curse of the
            Flying Hellfish'
          </i>
          ,{" "}
          <Link
            color={linkColor}
            href="https://en.wikipedia.org/wiki/Raging_Abe_Simpson_and_His_Grumbling_Grandson_in_%27The_Curse_of_the_Flying_Hellfish%27"
          >
            Wikipedia
          </Link>
        </Box>
        <Box paddingTop={3} paddingBottom={5}>
          <Divider />
        </Box>
        <Text>
          The tontine described here is a variant of the standard tontine that
          works as described above. In this scheme, people invest funds into a
          shared fund. It remains locked in the fund until only one member of
          the tontine remains, at which point they may claim the full sum of the
          invested funds.
        </Text>
        <Box p={2} />
        <Text paddingBottom={1}>
          Organizing a tontine on-chain has a variety of interesting properties,
          be them advantages or disadvantages:
        </Text>
        <UnorderedList spacing={2}>
          <ListItem>
            In traditional tontines it is difficult to devise a mechanism where
            the funds can only be retrieved once one member remains. This is
            easily enforced on chain.
          </ListItem>
          <ListItem>
            Aptos accounts need not necessarily be owned by a single individual.
            To avoid{" "}
            <Link
              color={linkColor}
              href="https://www.explainxkcd.com/wiki/index.php/538:_Security"
            >
              wrench attacks
            </Link>{" "}
            they may use a multisigner account, either shared with other
            individuals, or just sharded in a way that makes it hard for another
            party to get the full key.
          </ListItem>
          <ListItem>
            Aptos accounts do not strictly map to a single indvidiual. This has
            interesting implications. For example, a tontine could theoretically
            outlast generations, with accounts being handed down throughout
            time.
          </ListItem>
        </UnorderedList>
        <Text paddingTop={3}>
          Make sure you understand these properties before taking part in a
          tontine organized through this Move module.
        </Text>
        <Text paddingTop={3}>
          Learn more about the tontine lifecycle{" "}
          <Link
            color={linkColor}
            href="https://github.com/banool/aptos-tontine#standard-tontine-lifecycle"
          >
            here
          </Link>
          .
        </Text>
      </Box>
    </Box>
  );
};
