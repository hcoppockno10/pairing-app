import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PairingFunctionDefinition } from "../functions/pairing_function.ts";
import { CustomMessage } from "../functions/custom_message.ts";

const PairingGetResponseWorkflow = DefineWorkflow({
  callback_id: "pairing_getresponse_workflow",
  title: "Pairing get response workflow",
  description: "A workflow to add users who react to a post to a db",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.types.string,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
      message_ts: {
        type: Schema.types.string,
      },
      reaction: {
        type: Schema.types.string,
      },
    },
    required: ["channel", "user", "message_ts", "reaction"],
  },
});

const pairingFunctionStep = PairingGetResponseWorkflow.addStep(PairingFunctionDefinition, {
  user: PairingGetResponseWorkflow.inputs.user,
  channel: PairingGetResponseWorkflow.inputs.channel,
  reaction: PairingGetResponseWorkflow.inputs.reaction,
  message_ts: PairingGetResponseWorkflow.inputs.message_ts,
});


export default PairingGetResponseWorkflow;