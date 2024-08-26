import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PairingFunctionDefinition } from "../functions/pairing_function.ts";
import { ClearDatastoreFunctionDefinition } from "../functions/clear_datastore_function.ts";
import { CustomMessage } from "../functions/custom_message.ts";

const PairingWorkflow = DefineWorkflow({
  callback_id: "pairing_workflow",
  title: "Pairing workflow",
  description: "A workflow to create random pairings between users",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.types.string,
      },
    },
    required: ["channel"],
  },
});

const pairingAnnouncementStep = PairingWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: PairingWorkflow.inputs.channel,
  message: "React to this message with a :pear: if you would like to be paired with someone else in i.AI for a 1:1 this week. In 12 hours, we will randomly pair everyone who reacted with a :pear:. If you reacted with a :pear:, but later decide you no longer have the time to pair, please react with an :apple: to remove yourself from the list.",
});

const delayStep = PairingWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: 1,
});
const customMessageStep = PairingWorkflow.addStep(CustomMessage, {
  channel: PairingWorkflow.inputs.channel
});

const clearDatastoreStep = PairingWorkflow.addStep(ClearDatastoreFunctionDefinition, {});

export default PairingWorkflow;