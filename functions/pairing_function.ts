import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

export const PairingFunctionDefinition = DefineFunction({
  callback_id: "pairing_function",
  title: "Pairing function",
  description: "A function to save users who want to pair",
  source_file: "functions/pairing_function.ts",
  input_parameters: {
    properties: {
      want_to_pair: {
        type: Schema.types.boolean,
        description: "Whether the user wants to pair or not",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      }
    },
    required: ["want_to_pair", "user"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  PairingFunctionDefinition,
  async ({ inputs, client }) => {
    if (!inputs.want_to_pair) {
      console.log(`User ${inputs.user} does not want to pair.`);
      return { completed: true };
    }

    const uuid = crypto.randomUUID();
    const pairingObject = {
      user_id: inputs.user,
      object_id: uuid,
      created_at: new Date().toISOString(),
    };

    try {
      const putResponse = await client.apps.datastore.put<
        typeof SampleObjectDatastore.definition
      >({
        datastore: "SampleObjects",
        item: pairingObject,
      });

      if (!putResponse.ok) {
        console.error(`Failed to put item into the datastore: ${putResponse.error}`);
        return { completed: false };
      }

      console.log(`User ${inputs.user} saved for pairing.`);
      return { completed: true };
    } catch (error) {
      console.error(`Error in Pairing function: ${error}`);
      return { completed: false };
    }
  },
);