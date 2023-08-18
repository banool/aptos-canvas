import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "../processor/schema.graphql",
  documents: "src/processor/queries/**/*.graphql",
  generates: {
    "src/processor/generated/types.ts": {
      config: {
        emitLegacyCommonJSImports: false,
        namingConvention: "keep",
        avoidOptionals: true,
        strictScalars: true,
        scalars: {
          Any: "any",
          U8: "number",
          U16: "number",
          U32: "number",
          U64: "string",
          U128: "string",
          U256: "string",
          Address: "string",
        },
      },
      plugins: ["typescript"],
    },
    "src/processor/generated/operations.ts": {
      preset: "import-types-preset",
      presetConfig: {
        typesPath: "./types",
      },
      plugins: ["typescript-operations"],
    },
    "src/processor/generated/queries.ts": {
      preset: "import-types-preset",
      presetConfig: {
        typesPath: "./operations",
      },
      plugins: ["typescript-graphql-request"],
      config: {
        documentMode: "string",
        documentVariableSuffix: "",
      },
    },
  },
};

export default config;
