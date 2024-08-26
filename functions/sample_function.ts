import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

export const SampleFunctionDefinition = DefineFunction({
  callback_id: "sample_function",
  title: "Sample function",
  description: "A sample function",
  source_file: "functions/sample_function.ts",
  input_parameters: {
    properties: {
      message: {
        type: Schema.types.string,
        description: "Message to be posted",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
    },
    required: ["message", "user"],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  SampleFunctionDefinition,
  async ({ inputs, client }) => {
    const uuid = crypto.randomUUID();
    const sampleObject = {
      user_id: inputs.user,
      object_id: uuid,
      created_at: new Date().toISOString(),
    };

    try {
      const putResponse = await client.apps.datastore.put<
        typeof SampleObjectDatastore.definition
      >({
        datastore: "SampleObjects",
        item: sampleObject,
      });

      if (!putResponse.ok) {
        console.error(`Failed to put item into the datastore: ${putResponse.error}`);
        return { completed: false };
      }

      return { completed: true };
    } catch (error) {
      console.error(`Error in Sample function: ${error}`);
      return { completed: false };
    }
  },
);