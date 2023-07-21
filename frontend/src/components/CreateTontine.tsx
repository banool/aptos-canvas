import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { getModuleId, useGlobalState } from "../GlobalState";
import { FALLBACK_POLICY_RETURN_TO_MEMBERS } from "../constants";
import {
  Field,
  Form,
  FieldArray,
  useFormik,
  FormikProvider,
  FormikHelpers,
} from "formik";
import { useGetAnsNames } from "../api/hooks/useGetAnsName";
import { useGetAnsAddresses } from "../api/hooks/useGetAnsAddress";
import {
  aptToOcta,
  getDurationPretty,
  isValidAccountAddress,
  validateAptString,
} from "../utils";
import { create } from "../api/transactions";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "react-query";
import { SelectableTooltip } from "./SelectableTooltip";
import { useGetOperatorAddressOfStakingPool } from "../api/hooks/useGetOperatorAddressOfStakingPool";

interface MyFormValues {
  description: string;
  invitees: string[];
  requiredContribution: number;
  checkInFrequency: number;
  claimWindow: number;
  fallbackPolicy: string;
  delegationPool: string;
}

export function CreateTontine({}: {}) {
  const [state, _] = useGlobalState();
  const moduleId = getModuleId(state);
  const { signAndSubmitTransaction } = useWallet();
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (
    values: MyFormValues,
    actions: FormikHelpers<MyFormValues>,
  ) => {
    var invitees: string[] = [];
    values.invitees.forEach((invitee) => {
      if (isValidAccountAddress(invitee)) {
        invitees.push(invitee);
      } else {
        // Lookup the invitee's address if it is an ANS name.
        const ansAddressLookup = ansAddressLookups?.find(
          (ans) => ans.name === invitee,
        );
        if (ansAddressLookup?.address !== undefined) {
          invitees.push(ansAddressLookup.address);
        } else {
          throw "Invalid invitee, validation should have caught this";
        }
      }
    });

    var delegationPool;
    if (values.delegationPool === "") {
      // Entry functions can't take in Option so we represent None as 0x0.
      delegationPool = "0x0";
    } else if (isValidAccountAddress(values.delegationPool)) {
      delegationPool = values.delegationPool;
    } else {
      // Lookup the invitee's address if it is an ANS name.
      const ansAddressLookup = ansAddressLookups?.find(
        (ans) => ans.name === values.delegationPool,
      );
      if (ansAddressLookup?.address !== undefined) {
        delegationPool = ansAddressLookup.address;
      } else {
        throw "Invalid value for stake pool, validation should have caught this";
      }
    }

    const requiredContributionInOcta = aptToOcta(values.requiredContribution);

    try {
      await create(
        signAndSubmitTransaction,
        moduleId,
        state.network_value,
        values.description,
        invitees,
        values.checkInFrequency,
        values.claimWindow,
        requiredContributionInOcta,
        parseInt(values.fallbackPolicy),
        { delegationPool },
      );
      toast({
        title: "Tontine created",
        description: "Tontine created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      actions.resetForm();
      queryClient.invalidateQueries({ queryKey: "tontineMembership" });
    } catch (e) {
      toast({
        title: "Failed to tontine",
        description: `Failed to create tontine: ${e}`,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      actions.setSubmitting(false);
    }
  };

  const validateAddressInput = (value: string, blankOkay: boolean) => {
    let error;
    if (blankOkay && value === "") {
      return error;
    } else if (value === "") {
      error = "Cannot be blank";
    } else if (!isValidAccountAddress(value)) {
      // Lookup the invitee's address if it is an ANS name.
      error = "Not a valid address";
    }
    return error;
  };

  // Form level validation. This is run in addition to all the field level validation.
  const validateValues = (values: MyFormValues) => {
    var errors: any = {};
    if (values.invitees.length === 0) {
      errors.invitees = "Must invite at least one person";
    } else {
      let inviteesArrayErrors: string[] = [];
      values.invitees.forEach((invitee, index) => {
        let error = validateAddressInput(invitee, false);
        if (error) {
          inviteesArrayErrors[index] = error;
        }
      });
      if (inviteesArrayErrors.length > 0) {
        errors.invitees = inviteesArrayErrors;
      }
    }
    return errors;
  };

  const formik = useFormik<MyFormValues>({
    initialValues: {
      description: "",
      invitees: [""],
      requiredContribution: 10,
      checkInFrequency: 60 * 60,
      claimWindow: 60 * 60 * 24 * 30,
      fallbackPolicy: FALLBACK_POLICY_RETURN_TO_MEMBERS.toString(),
      delegationPool: "",
    },
    onSubmit: handleSubmit,
    validate: validateValues,
  });

  const validateDescription = (value: string) => {
    let error;
    if (!value) {
      error = "Cannot be blank";
    } else if (value.length > 64) {
      error = "Must be 64 characters or less";
    }
    return error;
  };

  const validateRequiredContribution = (value: string) => {
    let error;
    if (value === "") {
      error = "Cannot be blank";
    } else {
      const inputAsApt = validateAptString(value);
      if (inputAsApt === null) {
        error = "Invalid value";
      } else if (inputAsApt <= 0) {
        error = "Must be greater than 0";
      }
    }
    return error;
  };

  const validateCheckInFrequency = (value: string) => {
    let error;
    if (value === "") {
      return "Cannot be blank";
    } else {
      const num = parseInt(value);
      if (Number.isNaN(num)) {
        error = "Invalid value";
      } else if (num <= 0) {
        error = "Must be greater than 0";
      }
    }
    return error;
  };

  const validateClaimWindow = (value: string) => {
    let error;
    if (value === "") {
      return "Cannot be blank";
    } else {
      const num = parseInt(value);
      if (Number.isNaN(num)) {
        error = "Invalid value";
      } else if (num <= 0) {
        error = "Must be greater than 0";
      }
    }
    return error;
  };

  const entriesToLookup = formik.values.invitees.filter(
    (invitee) => invitee !== "",
  );

  const { data: ansNameLookups } = useGetAnsNames(entriesToLookup, {
    enabled: entriesToLookup.length > 0,
  });
  const { data: ansAddressLookups } = useGetAnsAddresses(
    () => entriesToLookup,
    { enabled: entriesToLookup.length > 0 },
  );

  const delegationPoolValid =
    validateAddressInput(formik.values.delegationPool, false) === undefined;
  const { operatorAddress, isLoading, error } =
    useGetOperatorAddressOfStakingPool(formik.values.delegationPool, {
      enabled: delegationPoolValid,
    });

  var operatorAddressString: string | undefined = undefined;
  if (delegationPoolValid) {
    if (isLoading) {
      operatorAddressString = "Loading operator address...";
    } else if (operatorAddress) {
      operatorAddressString = `Operator address: ${operatorAddress}`;
    }
  }

  const validateDelegationPool = () => {
    var validationError;
    if (delegationPoolValid) {
      if (error) {
        validationError = "Failed to load operator address";
      } else if (operatorAddress === undefined) {
        validationError = "No operator address found";
      }
    }
    return validationError;
  };

  return (
    <Box p={7}>
      <FormikProvider value={formik}>
        <Form>
          <Field name="description" validate={validateDescription}>
            {({ field, form }: { field: any; form: any }) => {
              return (
                <FormControl
                  isInvalid={
                    form.errors.description && form.touched.description
                  }
                >
                  <FormLabel>Description</FormLabel>
                  <Input w="40%" {...field} />
                  <FormErrorMessage>{form.errors.description}</FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
          <FieldArray
            name="invitees"
            render={(arrayHelpers) => {
              return (
                <Box paddingTop={5}>
                  <FormControl
                    isInvalid={
                      formik.touched.invitees &&
                      !!formik.errors.invitees &&
                      (typeof formik.errors.invitees === "string" ||
                        formik.errors.invitees.some((error) => error))
                    }
                  >
                    <FormLabel>
                      {"Invitees "}

                      <sup>
                        <Tooltip label="You may enter either account addresses or ANS names.">
                          ⓘ
                        </Tooltip>
                      </sup>
                    </FormLabel>
                    {formik.values.invitees.map((invitee, index) => {
                      var helper;
                      const ansNameLookup = ansNameLookups?.find(
                        (ans) => ans.address === invitee,
                      );
                      const ansAddressLookup = ansAddressLookups?.find(
                        (ans) => ans.name === invitee,
                      );
                      if (ansNameLookup?.name) {
                        helper = (
                          <Text p={2}>{`${ansNameLookup.name}.apt`}</Text>
                        );
                      } else if (ansAddressLookup?.address) {
                        helper = <Text p={2}>{ansAddressLookup.address}</Text>;
                      }
                      return (
                        <Box paddingBottom={4} key={index}>
                          <HStack key={index}>
                            <Field name={`invitees.${index}`}>
                              {({ field }: { field: any }) => (
                                <Input
                                  w="75%"
                                  placeholder="Invitee address or ANS name"
                                  {...field}
                                  id={`invitees.${index}`}
                                />
                              )}
                            </Field>
                            <IconButton
                              aria-label="Remove Invitee"
                              icon={<MinusIcon />}
                              onClick={() => arrayHelpers.remove(index)}
                              isDisabled={formik.values.invitees.length === 1}
                            />
                            <IconButton
                              aria-label="Add Invitee"
                              icon={<AddIcon />}
                              onClick={() => arrayHelpers.push("")}
                            />
                          </HStack>
                          {helper}
                          <FormErrorMessage>
                            {formik.errors.invitees?.[index]}
                          </FormErrorMessage>
                        </Box>
                      );
                    })}
                  </FormControl>
                </Box>
              );
            }}
          />
          <Field
            name="requiredContribution"
            validate={validateRequiredContribution}
          >
            {({ field, form }: { field: any; form: any }) => {
              return (
                <FormControl
                  isInvalid={
                    form.errors.requiredContribution &&
                    form.touched.requiredContribution
                  }
                >
                  <FormLabel paddingTop={5}>
                    Required contribution (APT)
                  </FormLabel>
                  <Input w="30%" {...field} />
                  <FormErrorMessage>
                    {form.errors.requiredContribution}
                  </FormErrorMessage>
                </FormControl>
              );
            }}
          </Field>
          <Field name="checkInFrequency" validate={validateCheckInFrequency}>
            {({ field, form }: { field: any; form: any }) => {
              const helper = field.value ? (
                <FormHelperText>
                  {getDurationPretty(field.value)}
                </FormHelperText>
              ) : null;
              return (
                <FormControl
                  isInvalid={
                    form.errors.checkInFrequency &&
                    form.touched.checkInFrequency
                  }
                >
                  <FormLabel paddingTop={5}>
                    Check in frequency (secs)
                  </FormLabel>
                  <Input w="30%" {...field} />
                  <FormErrorMessage>
                    {form.errors.checkInFrequency}
                  </FormErrorMessage>
                  {helper}
                </FormControl>
              );
            }}
          </Field>
          <Field name="claimWindow" validate={validateClaimWindow}>
            {({ field, form }: { field: any; form: any }) => {
              const helper = field.value ? (
                <FormHelperText>
                  {getDurationPretty(field.value)}
                </FormHelperText>
              ) : null;
              return (
                <FormControl
                  isInvalid={
                    form.errors.claimWindow && form.touched.claimWindow
                  }
                >
                  <FormLabel paddingTop={5}>Claim window (secs)</FormLabel>
                  <Input w="30%" {...field} />
                  <FormErrorMessage>{form.errors.claimWindow}</FormErrorMessage>
                  {helper}
                </FormControl>
              );
            }}
          </Field>
          <Field name="fallbackPolicy">
            {({ field, form }: { field: any; form: any }) => (
              <FormControl
                isInvalid={
                  form.errors.fallbackPolicy && form.touched.fallbackPolicy
                }
              >
                <FormLabel paddingTop={5}>Fallback Policy</FormLabel>
                <RadioGroup
                  id="fallbackPolicy"
                  {...field}
                  value={field.value || ""}
                  onChange={(val) => {
                    form.setFieldValue(field.name, val);
                  }}
                >
                  <Stack paddingBottom={4} direction="row">
                    <Radio value={FALLBACK_POLICY_RETURN_TO_MEMBERS.toString()}>
                      Return to members
                    </Radio>
                  </Stack>
                </RadioGroup>
                <FormErrorMessage>
                  {form.errors.fallbackPolicy}
                </FormErrorMessage>
              </FormControl>
            )}
          </Field>
          <Field
            name="delegationPool"
            validate={(value: string) => validateDelegationPool()}
          >
            {({ field, form }: { field: any; form: any }) => {
              const helper = operatorAddressString ? (
                <FormHelperText>{operatorAddressString}</FormHelperText>
              ) : null;
              return (
                <FormControl
                  isInvalid={
                    form.errors.delegationPool && form.touched.delegationPool
                  }
                >
                  <FormLabel>
                    {"Stake with delegation pool "}
                    <SelectableTooltip
                      label="If you'd like to stake funds while the tontine is locked, provide the address of a delegation pool. This corresponds to the staking pool address here: https://explorer.aptoslabs.com/validators/delegation. Not the operator address."
                      textComponent={<sup>ⓘ</sup>}
                      options={{ hideButton: true }}
                    />
                  </FormLabel>
                  <Input
                    w="75%"
                    placeholder="Delegation pool address (optional)"
                    {...field}
                  />
                  <FormErrorMessage>
                    {form.errors.delegationPool}
                  </FormErrorMessage>
                  {helper}
                </FormControl>
              );
            }}
          </Field>
          <Box paddingTop={5}>
            <Button
              type="submit"
              isDisabled={!formik.isValid}
              isLoading={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <Spinner size="xs" />
              ) : (
                <Text>Submit</Text>
              )}
            </Button>
          </Box>
        </Form>
      </FormikProvider>
    </Box>
  );
}
