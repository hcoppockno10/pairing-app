import { Manifest } from "deno-slack-sdk/mod.ts";
import PairingWorkflow from "./workflows/pairing_workflow.ts";
import PairingGetResponseWorkflow from "./workflows/pairing_getresponse_workflow.ts";
import SampleObjectDatastore from "./datastores/sample_datastore.ts";

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "pairing-app",
  description: "A template for building Slack apps with Deno",
  icon: "assets/pear.png",
  workflows: [PairingGetResponseWorkflow],
  outgoingDomains: [],
  datastores: [SampleObjectDatastore],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "reactions:read",
  ],
});
