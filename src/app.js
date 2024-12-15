import { provider } from "./provider/index.js";
import { createBot } from "@builderbot/bot";
import { database } from "./database/index.js";
import { flow } from "./flow/index.js";
import { registerRoutes } from './routes/routes.js'; // Import the routes
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT ?? 3008;

const main = async () => {
  const { handleCtx, httpServer } = await createBot({
    flow,
    provider,
    database,
  });
 
  // Register all routes from the routes.js file
  registerRoutes(provider, handleCtx);

  httpServer(+PORT);
};

main();
