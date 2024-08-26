import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

export const ClearDatastoreFunctionDefinition = DefineFunction({
  callback_id: "clear_datastore_function",
  title: "Clear Datastore Function",
  description: "A function to remove all instances from the datastore",
  source_file: "functions/clear_datastore_function.ts",
  input_parameters: {
    properties: {},
    required: [],
  },
  output_parameters: {
    properties: {
      success: {
        type: Schema.types.boolean,
        description: "Whether the datastore was cleared successfully",
      },
      items_removed: {
        type: Schema.types.number,
        description: "The number of items removed from the datastore",
      },
    },
    required: ["success", "items_removed"],
  },
});

export default SlackFunction(
  ClearDatastoreFunctionDefinition,
  async ({ client }) => {
    let success = false;
    let itemsRemoved = 0;

    try {
      // Query for all items in the datastore
      const queryResponse = await client.apps.datastore.query<
        typeof SampleObjectDatastore.definition
      >({
        datastore: "SampleObjects",
      });

      if (queryResponse.ok && queryResponse.items.length > 0) {
        // Delete each item found
        for (const item of queryResponse.items) {
          const deleteResponse = await client.apps.datastore.delete<
            typeof SampleObjectDatastore.definition
          >({
            datastore: "SampleObjects",
            id: item.object_id,
          });
          if (deleteResponse.ok) {
            itemsRemoved++;
          } else {
            console.error(`Failed to delete item ${item.object_id}: ${deleteResponse.error}`);
          }
        }
        console.log(`Removed ${itemsRemoved} entries from the datastore`);
        success = true;
      } else if (!queryResponse.ok) {
        console.error(`Failed to query datastore: ${queryResponse.error}`);
      } else {
        console.log("No items found in the datastore");
        success = true;
      }
    } catch (error) {
      console.error(`Error clearing datastore: ${error}`);
    }

    return { 
      completed: true, 
      outputs: { 
        success: success,
        items_removed: itemsRemoved
      } 
    };
  },
);