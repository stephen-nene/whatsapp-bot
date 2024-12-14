import { createFlow } from "@builderbot/bot";

import { welcomeFlow } from "./welcome.flow.js";
import { registerFlow } from "./register.flow.js";
import { fullSamplesFlow } from "./media.flow.js";



export const flow = createFlow([welcomeFlow, registerFlow, fullSamplesFlow]);

