import { createFlow } from "@builderbot/bot";

import { welcomeFlow } from "./welcome.flow.js";
import { kcpeCheckFlow } from "./kcpe.flow.js";
import { kcseCheckFlow } from "./kcse.flow.js";
import { goodConductCheckFlow } from "./goodConduct.flow.js";
import { drivingLicenseCheckFlow } from "./drivingLicense.flow.js";

export const flow = createFlow([
  welcomeFlow,
  kcpeCheckFlow,
  kcseCheckFlow,
  goodConductCheckFlow,
  drivingLicenseCheckFlow,
]);
