import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import SampleObjectDatastore from "../datastores/sample_datastore.ts";

export const CustomMessage = DefineFunction({
  callback_id: "CustomMessage",
  title: "Sending the Welcome Message",
  description: "Pull the welcome messages and sends it to the new user",
  source_file: "functions/custom_message.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "Channel where the event was triggered",
      },
    },
    required: ["channel"],
  },
  output_parameters: {
    properties: {
      message_count: {
        type: Schema.types.number,
        description: "Number of messages sent",
      },
      success: {
        type: Schema.types.boolean,
        description: "Whether the operation was successful",
      },
    },
    required: ["message_count", "success"],
  },
});

export default SlackFunction(CustomMessage, async ({ inputs, client }) => {
  const time_start = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const time_end = new Date();
  
  // Querying datastore for stored messages
  const messages = await client.apps.datastore.query<
    typeof SampleObjectDatastore.definition
  >({
    datastore: SampleObjectDatastore.name,
    expression: "#created_at BETWEEN :time_start AND :time_end",
    expression_attributes: { "#created_at": "created_at" },
    expression_values: {
      ":time_start": time_start.toISOString(),
      ":time_end": time_end.toISOString(),
    },
  });
  
  if (!messages.ok) {
    console.error("Failed to gather welcome messages:", messages.error);
    return { error: `Failed to gather welcome messages: ${messages.error}` };
  }

  console.log("Debug - Retrieved messages:", messages.items);
  
  let message_count = 0;
  
  // Extract unique users from messages
  const users = [...new Set(messages.items.map(item => item.user_id))];
  const shuffledUsers = users.sort(() => 0.5 - Math.random());
  
  // Create pairs
  const pairs = [];
  for (let i = 0; i < shuffledUsers.length; i += 2) {
    if (i + 1 < shuffledUsers.length) {
      pairs.push([shuffledUsers[i], shuffledUsers[i + 1]]);
    } else {
      // If there's an odd number of users, add the last user to the last pair
      if (pairs.length > 0) {
        pairs[pairs.length - 1].push(shuffledUsers[i]);
      } else {
        // If there's only one user
        pairs.push([shuffledUsers[i]]);
      }
    }
  }
  
  // Send messages for each pair
  for (const pair of pairs) {
    let text;
    if (pair.length === 1) {
      text = `Hello <@${pair[0]}>! Unfortunately, there are no other available partners to :pear: with for this session.`;
    } else if (pair.length === 2) {
      text = `Hello <@${pair[0]}> and <@${pair[1]}>! You've been :pear:'d for this programming session. Please reach out to each other and organise a time to meet!`;
    } else {
      text = `Hello <@${pair[0]}>, <@${pair[1]}>, and <@${pair[2]}>! You've been bunched together for this programming session as there were an odd number of people. Please reach out to each other and organise a time to meet!`;
    }
    
    console.log("Debug - Message text:", text);
    console.log("Debug - User IDs:", pair);
    
    try {
      const message = await client.chat.postMessage({
        channel: inputs.channel,
        text: text,
      });
      
      if (!message.ok) {
        console.error("Error posting message:", message.error);
        return { 
          outputs: {
            message_count,
            success: false
          }
        };
      }
      message_count++;
    } catch (error) {
      console.error("Error posting message:", error);
      return { 
        outputs: {
          message_count,
          success: false
        }
      };
    }
  }
  
  return { 
    outputs: {
      message_count,
      success: true
    }
  };
});