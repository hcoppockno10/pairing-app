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
  message: `
:pear: *Pairing Opportunity Alert!* :pear:

Attention i.AI team members! It's time for our weekly pairing session! These sessions are an oppurtunity to share knowledge, learn new skills, and collaborate with your peers.

*How to participate:*
1. :eyes: See this message
2. React with a :pear: if you're interested
3. :hourglass_flowing_sand: Wait 24 hours for the magic to happen
4.Get :pear:ed with a random teammate

*Changed your mind?*
No worries! Just react with an :apple: to opt-out.

Connect, collaborate, and create something amazing! :rocket:
  `.trim(),
});

const delayStep = PairingWorkflow.addStep(Schema.slack.functions.Delay, {
  minutes_to_delay: 24 * 60,
});

const customMessageStep = PairingWorkflow.addStep(CustomMessage, {
  channel: PairingWorkflow.inputs.channel,
  message_ts: pairingAnnouncementStep.outputs.message_context.message_ts,
});

const clearDatastoreStep = PairingWorkflow.addStep(ClearDatastoreFunctionDefinition, {});

export default PairingWorkflow;