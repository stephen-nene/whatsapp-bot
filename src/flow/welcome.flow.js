import { addKeyword } from "@builderbot/bot";
import { kcpeCheckFlow } from "./kcpe.flow.js";
import { kcseCheckFlow } from "./kcse.flow.js";
import { goodConductCheckFlow } from "./goodConduct.flow.js";
import { drivingLicenseCheckFlow } from "./drivingLicense.flow.js";

export const welcomeFlow = addKeyword([ "menu", "hello", "hola"])
  .addAnswer(
    `🙌 *Karibu!* Welcome to our government services chatbot! 🇰🇪\nHere, we provide easy access to various services. Let's get started! 🤗`
  )
  .addAnswer(
    `We offer the following government services to assist you 👇:

1️⃣ *KCpE Checker* 🔍 - Check your KCpE results.
2️⃣ *KCSE Checker* 📜 - Check your KCSE results. 
3️⃣ *Good Conduct Checker* 🛂 - Check your good conduct certificate status.
4️⃣ *Driving License Checker* 🚗 - Check your driving license status.

Please type the number of the service you'd like to explore. 😊`,
    { capture: true },
    async (ctx, { gotoFlow, flowDynamic }) => {
      const userChoice = ctx.body.trim();

      // Redirect to the respective flow based on user input
      if (userChoice === "1") {
        return gotoFlow(kcpeCheckFlow);
      } else if (userChoice === "2") {
        return gotoFlow(kcseCheckFlow);
      } else if (userChoice === "3") {
        return gotoFlow(goodConductCheckFlow);
      } else if (userChoice === "4") {
        return gotoFlow(drivingLicenseCheckFlow);
      } else {
        // Handle invalid input by redirecting the user back to the welcomeFlow
        await flowDynamic(
          "❌ Invalid selection. Please choose a number between 1-4. 😊"
        );

        // Redirect to the welcome flow for a new selection
        return gotoFlow(welcomeFlow);
      }
    }
  );
