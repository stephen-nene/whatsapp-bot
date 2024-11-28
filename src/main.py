from logger import setup_logger
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from bot_logic import handle_message
from twilio.twiml.messaging_response import MessagingResponse

# Set up logging
logger = setup_logger(name="requests")

app = FastAPI()

@app.get("/")
async def welcome():
    logger.info("Welcome endpoint hit")
    return JSONResponse(content={"web": "Welcome! We're coding away like 🐒 on caffeine!"})

@app.post("/webhook")
async def whatsapp_webhook(request: Request):
    try:
        form_data = await request.form()
        logger.info("Twilio POST Data: %s", dict(form_data))

        response = await handle_message(form_data.get("From", ""), form_data.get("Body", "").strip())
        return HTMLResponse(content=str(response))
    except Exception as e:
        logger.error("Webhook error: %s", e)
        fallback_response = MessagingResponse()
        fallback_response.message("⚠️ Technical difficulties. Please try again later.")
        return HTMLResponse(content=str(fallback_response))
