from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from twilio.twiml.messaging_response import MessagingResponse
import time

app = FastAPI()

# Mock database for tracking user sessions
user_sessions = {}

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
    form_data = await request.form()
    from_number = form_data.get("From")
    body = form_data.get("Body").strip()

    response = MessagingResponse()

    # Initial greeting and state setup
    if from_number not in user_sessions:
        # Initiate a new user session
        user_sessions[from_number] = {"state": "awaiting_registration"}
        response.message("👋 Welcome! Please send your registration number to proceed.")
    elif user_sessions[from_number]["state"] == "awaiting_registration":
        # Store registration number and prompt for payment
        user_sessions[from_number]["registration_number"] = body
        user_sessions[from_number]["state"] = "processing_payment"
        response.message(
            f"👨🏿‍💻 Registration number received: {body}. Our admins are processing your request. Please wait."
        )
        response.message(
            f"👨🏿‍🎤 Here admins will check the registration_number and initiate an STK to user..."
        )
        response.message(
            "💵 Payment processing... An STK push has been sent to your number for approval. "
            "🕵🏿‍♀️ Please enter your password to proceed with the payment."
        )
        response.message("👌🏿 Type anything and send to simulate the payment")
        user_sessions[from_number]["state"] = "awaiting_password"  # Move to next state
    elif user_sessions[from_number]["state"] == "awaiting_password":
        # Handle the password entry (simulate successful payment)
        user_sessions[from_number]["password"] = body
        user_sessions[from_number]["state"] = "completed"
        
        response.message(
            "✅ Payment successful! Your test results are ready:\n"
            "- Blood Pressure: Normal ❤️‍🩹\n"
            "- Cholesterol: Elevated ❤️‍🔥\n"
            "\nThank you for using our service!"
        )
        response.message("😵 There was an error with your payment. Please try again ⛔️")
        
        # End session
        del user_sessions[from_number]
    else:
        # Handle unexpected inputs
        response.message("❓ I'm sorry, I didn't understand that. Please start again by sending your registration number.")

    # Return the response in XML format as Twilio expects
    return HTMLResponse(content=str(response))
