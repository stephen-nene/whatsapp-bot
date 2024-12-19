import { createFlow } from "@builderbot/bot";

import { welcomeFlow } from "./welcome.flow.js";
import { kcpeCheckFlow } from "./government/kcpe.flow.js";
import { kcseCheckFlow } from "./government/kcse.flow.js";
import { goodConductCheckFlow } from "./government/goodConduct.flow.js";
import { drivingLicenseCheckFlow } from "./government/drivingLicense.flow.js";

// AI model
import { grokTalkFlow } from "./Grok/grok.flow.js";

import { payGrokFlow } from "./payment/payment.flow.js";

import { neneFlow } from "./AI/nene.flow.js";

export const flow = createFlow([
  welcomeFlow,
  kcpeCheckFlow,
  kcseCheckFlow,
  goodConductCheckFlow,
  drivingLicenseCheckFlow,
  grokTalkFlow,
  payGrokFlow,
  neneFlow,
  // Add more flows here as needed...
]);
