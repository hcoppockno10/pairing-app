// triggers/pairing_trigger.ts
import { Trigger } from "deno-slack-sdk/types.ts";
import PairingWorkflow from "../workflows/pairing_workflow.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

const trigger: Trigger<typeof PairingWorkflow.definition> = {
  type: TriggerTypes.Scheduled,
  name: "Trigger a scheduled message to encourage users to pair",
  workflow: `#/workflows/${PairingWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: `C0789HCV4CE`,
    },
  },
  schedule: {
    start_time: "2024-09-24T09:00:00Z",
    end_time: "2037-12-31T23:59:59Z",
    frequency: { type: "weekly", repeats_every: 1 },
  },
};

export default trigger;