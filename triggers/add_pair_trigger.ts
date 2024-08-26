import { Trigger } from "deno-slack-sdk/types.ts";
import PairingWorkflow from "../workflows/pairing_workflow.ts";
import PairingGetResponseWorkflow from "../workflows/pairing_getresponse_workflow.ts";
import { TriggerContextData, TriggerTypes, TriggerEventTypes } from "deno-slack-api/mod.ts";

/**
 * A trigger that periodically starts the pairing workflow.
 */
const trigger: Trigger<typeof PairingGetResponseWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Add pair",
  description: "If the reaction is a pear, add the user to the pairing list",
  workflow: `#/workflows/${PairingGetResponseWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: `C06EB23UCP5`,
    },
    user: {
      value: TriggerContextData.Event.ReactionAdded.user_id,
    },
    message_ts: {
      value: TriggerContextData.Event.ReactionAdded.message_ts,
    },
    reaction: {
      value: TriggerContextData.Event.ReactionAdded.reaction,
    }
  },
  event: {
    event_type: TriggerEventTypes.ReactionAdded,
    channel_ids: ["C06EB23UCP5"],
    filter: {
      version: 1,
      root: {
        operator: "OR",
        inputs: [{
          statement: "{{data.reaction}} == pear"
        },
          {
            statement: "{{data.reaction}} == apple"
          }],
      }
    }
  },
}

export default trigger;