// triggers/pairing_trigger.ts
import { Trigger } from "deno-slack-sdk/types.ts";
import PairingWorkflow from "../workflows/pairing_workflow.ts";
import { TriggerContextData, TriggerTypes } from "deno-slack-api/mod.ts";

/**
 * A trigger that periodically starts the pairing workflow.
 */
const trigger: Trigger<typeof PairingWorkflow.definition> = {
  type: TriggerTypes.Scheduled,
  name: "Trigger a scheduled message to encourage users to pair",
  workflow: `#/workflows/${PairingWorkflow.definition.callback_id}`,
  inputs: {
    channel: {
      value: `C07JLK4K3QC`,
    },
  },
  schedule: {
    // Schedule the first execution 60 seconds from when the trigger is created
    start_time: new Date(new Date().getTime() + 60000).toISOString(),
    end_time: "2037-12-31T23:59:59Z",
    frequency: { type: "hourly", repeats_every: 1 },
  },
};

export default trigger;
