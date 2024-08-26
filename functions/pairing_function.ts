import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

export const PairingFunctionDefinition = DefineFunction({
  callback_id: "pairing_function",
  title: "Pairing function",
  description: "A function to manage pairing preferences and send an ephemeral message",
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
      },
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The channel to send the ephemeral message to",
      }
    },
    required: ["want_to_pair", "user", "channel"],
  },
  output_parameters: {
    properties: {
      message_sent: {
        type: Schema.types.boolean,
        description: "Whether the ephemeral message was sent successfully",
      },
    },
    required: ["message_sent"],
  },
});

export default SlackFunction(
  PairingFunctionDefinition,
  async ({ inputs, client }) => {
    let message: string;
    let messageSent = false;

    if (inputs.want_to_pair) {
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
          message = "There was an error processing your request. Please try again later.";
        } else {
          console.log(`User ${inputs.user} saved for pairing.`);
          message = "Your request to be :pear:'d has been successfully logged. You will be notified of your partner tomorrow morning.";
        }
      } catch (error) {
        console.error(`Error in Pairing function: ${error}`);
        message = "There was an error processing your request. Please try again later.";
      }
    } else {
      console.log(`User ${inputs.user} does not want to pair.`);
      try {
        // Query for items with the user's ID
        const queryResponse = await client.apps.datastore.query<
          typeof SampleObjectDatastore.definition
        >({
          datastore: "SampleObjects",
          expression: "#user_id = :user_id",
          expression_attributes: { "#user_id": "user_id" },
          expression_values: { ":user_id": inputs.user },
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
            if (!deleteResponse.ok) {
              console.error(`Failed to delete item ${item.object_id}: ${deleteResponse.error}`);
            }
          }
          console.log(`Removed ${queryResponse.items.length} entries for user ${inputs.user}`);
        } else if (!queryResponse.ok) {
          console.error(`Failed to query datastore: ${queryResponse.error}`);
        }

        message = "You have opted out of :pear:ing for this week.";
      } catch (error) {
        console.error(`Error removing user entries: ${error}`);
        message = "There was an error processing your request, but you have been opted out of pairing. Please try again later if you want to opt back in.";
      }
    }

    // Send the ephemeral message
    try {
      const result = await client.chat.postEphemeral({
        channel: inputs.channel,
        user: inputs.user,
        text: message,
      });
      if (result.ok) {
        messageSent = true;
        console.log("Ephemeral message sent successfully");
      } else {
        console.error(`Failed to send ephemeral message: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error sending ephemeral message: ${error}`);
    }

    return { completed: true, outputs: { message_sent: messageSent } };
  },
);