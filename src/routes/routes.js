// src/routes/routes.js
import {
  initiateSTKPush,
  handleCallback,
} from "../controllers/mpesacontroller.js"; // Import the STK push function

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

};
