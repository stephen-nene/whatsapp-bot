// src/routes/routes.js
import {
  initiateSTKPush,
  handleCallback,
} from "../controllers/mpesacontroller.js"; // Import the STK push function

import { modelsController } from "../controllers/modelscontroller.js";
export const registerRoutes = (provider, handleCtx) => {
  provider.server.post(
    "/v1/messages",
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end("sended");
    })
  );

  provider.server.post(
    "/v1/register",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("REGISTER_FLOW", { from: number, name });
      return res.end("trigger");
    })
  );

  provider.server.post(
    "/v1/samples",
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch("SAMPLES", { from: number, name });
      return res.end("trigger");
    })
  );

  provider.server.post(
    "/v1/blacklist",
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === "remove") bot.blacklist.remove(number);
      if (intent === "add") bot.blacklist.add(number);

      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "ok", number, intent }));
    })
  );

  provider.server.post(
    "/v1/mpesa/stkpush",
    handleCtx(async (bot, req, res) => {
      const { phone, amount } = req.body;
      try {
        // Call the STK Push controller
        const response = await initiateSTKPush({ phone, amount });

        // Return response from Mpesa
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(response));
      } catch (error) {
        // Handle error and send response
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: error.message }));
      }
    })
  );
  provider.server.post(
    "/v1/mpesa/callback",
    handleCtx(async (bot, req, res) => {
      try {
        // Call the callback handler to process the callback
        await handleCallback(req, res);
      } catch (error) {
        // Handle any errors
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: error.message }));
      }
    })
  );

  // Get all AI models
  provider.server.get(
    "/v1/models",
    handleCtx(async (bot, req, res) => {
      await modelsController.getAllModels(req, res);
    })
  );

  // Create a new AI model
  provider.server.post(
    "/v1/models",
    handleCtx(async (bot, req, res) => {
      await modelsController.createModel(req, res);
    })
  );

  // Get a specific AI model by ID
  provider.server.get(
    "/v1/models/:id",
    handleCtx(async (bot, req, res) => {
      await modelsController.getModelById(req, res);
    })
  );

  // Update an AI model
  provider.server.put(
    "/v1/models/:id",
    handleCtx(async (bot, req, res) => {
      await modelsController.updateModel(req, res);
    })
  );

  // Delete an AI model
  provider.server.delete(
    "/v1/models/:id",
    handleCtx(async (bot, req, res) => {
      await modelsController.deleteModel(req, res);
    })
  );
  
};