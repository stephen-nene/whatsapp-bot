from bot_logic import handle_message
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from twilio.twiml.messaging_response import MessagingResponse



# Create logger
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)  # Global log level

# File handler for writing logs to a file
file_handler = logging.FileHandler("../log/requests.log")
file_handler.setLevel(logging.INFO)

# Formatter to add timestamps to log messages
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
file_handler.setFormatter(formatter)

# Add handlers to logger
logger.addHandler(file_handler)

app = FastAPI()

# Mount the '/files' route to serve static files from 'src/files' directory
app.mount("/files", StaticFiles(directory="../files"), name="files")

@app.get("/")
async def welcome():
    """
    Welcome route with a funny message and an emoji.
    """
    return JSONResponse(content={"web": "Welcome! We're coding away like 🐒 on caffeine!"})

@app.post("/webhook")
async def whatsapp_webhook(request: Request):
    """
    Handles incoming WhatsApp messages from Twilio.
    """
    try:
        # Parse form data and log as JSON
        form_data = await request.form()
        form_dict = dict(form_data)  # Convert to dictionary

        # Log the request with a timestamp
        logger.info("Twilio POST Data: %s", str(form_dict))

        # Extract fields
        from_number = form_dict.get("From", "")
        body = form_dict.get("Body", "").strip()

        # Delegate message handling to the bot_logic module
        response = await handle_message(from_number, body)

        # Return the response in XML format as Twilio expects
        return HTMLResponse(content=str(response))

    except Exception as e:
        # Log the error with a timestamp
        logger.error("Error: %s", str(e))

        # Notify the user of the issue
        fallback_response = MessagingResponse()
        fallback_response.message(
            "⚠️ We're experiencing technical difficulties. Our team has been alerted and is working to resolve the issue. Please try again later."
        )
        return HTMLResponse(content=str(fallback_response))
