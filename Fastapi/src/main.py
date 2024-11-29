from logger import setup_logger
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from bot_logic import handle_message
from twilio.twiml.messaging_response import MessagingResponse
import logging
from models import user_sessions

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mpesa")
logger = setup_logger(name="requests")

app = FastAPI()

@app.post("/mpesa-callback")
async def mpesa_callback(request: Request):
    """
    Receives transaction status updates from Safaricom.
    """
    try:
        data = await request.json()
        logger.info(f"Callback data received: {data}")

        # Parse important details (example)
        result_code = data.get("Body", {}).get("stkCallback", {}).get("ResultCode", "")
        result_desc = data.get("Body", {}).get("stkCallback", {}).get("ResultDesc", "")
        from_number = data.get("Body", {}).get("stkCallback", {}).get("PhoneNumber", "")
    
        if result_code == 0:  # Payment succeeded
            logger.info(f"(Sandbox) Payment completed successfully: {result_desc}")
            # Update the user's session state to reflect successful payment
            user_sessions[from_number]["state"] = "payment_successful"
            response_message = "✅ Payment successful! Thank you for your purchase."
        else:  # Payment failed
            logger.warning(f"(Sandbox) Payment failed: {result_desc}")
            # Reset user state to reinitiate the payment process
            user_sessions[from_number]["state"] = "processing_payment"
            response_message = f"❌ Payment failed. Reason: {result_desc}. Please try the payment process again."
            response_message += "\n💵 A new payment request has been sent to your phone."

            # Trigger bot to send payment again if failure occurred
            # Instead of a direct response, re-call the handle_message function to continue the flow
            response = await handle_message(from_number, "")  # You can use a more contextual body here if needed.
            return JSONResponse(content={"message": str(response)})

        return {"status": "success", "message": response_message}
    except Exception as e:
        logger.error(f"Error handling callback: {e}")
        return {"status": "error", "message": str(e)}

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
