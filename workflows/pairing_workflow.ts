import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { PairingFunctionDefinition } from "../functions/pairing_function.ts";
import { CustomMessage } from "../functions/custom_message.ts";

const PairingWorkflow = DefineWorkflow({
  callback_id: "pairing_workflow",
  title: "Pairing workflow",
  description: "A workflow to ask users if they want to pair",
  input_parameters: {
    properties: {
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
      channel: {
        type: Schema.slack.types.channel_id,
      },
      user: {
        type: Schema.slack.types.user_id,
      },
    },
    required: ["interactivity", "channel", "user"],
  },
});

const pairingForm = PairingWorkflow.addStep(
  Schema.slack.functions.OpenForm,
  {
    title: "this week?",
    interactivity: PairingWorkflow.inputs.interactivity,
    submit_label: "Submit",
    fields: {
      elements: [{
        name: "channel",
        title: "Channel to send message to",
        type: Schema.slack.types.channel_id,
        default: PairingWorkflow.inputs.channel,
      }, {
        name: "want_to_pair",
        title: "Do you want to pair?",
        type: Schema.types.boolean,
        description: "Select yes if you'd like to pair with someone this week.",
      }],
      required: ["channel", "want_to_pair"],
    },
  },
);

const pairingFunctionStep = PairingWorkflow.addStep(PairingFunctionDefinition, {
  want_to_pair: pairingForm.outputs.fields.want_to_pair,
  user: PairingWorkflow.inputs.user,
  channel: pairingForm.outputs.fields.channel,
});


const customMessageStep = PairingWorkflow.addStep(CustomMessage, {
  channel: pairingForm.outputs.fields.channel,
});

export default PairingWorkflow;