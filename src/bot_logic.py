from twilio.twiml.messaging_response import MessagingResponse
from twilio.base.exceptions import TwilioRestException
from mpesa_integration import simulate_mpesa_stk_push
from models import user_sessions, registered_users
from typing import Dict



# Function to check registration number
def check_registration_number(reg_number: str):
    user_info = registered_users.get(reg_number.upper())  # Normalize case
    if user_info:
        return True, user_info
    return False, None



async def handle_message(from_number: str, body: str) -> MessagingResponse:
    response = MessagingResponse()
    try:
        # Initial greeting and state setup
        if from_number not in user_sessions:
            user_sessions[from_number] = {"state": "awaiting_registration"}
            response.message("👋 Welcome! Please send your registration number to proceed.")
        elif user_sessions[from_number]["state"] == "awaiting_registration":
            reg_number = body.strip()
            user_sessions[from_number]["registration_number"] = reg_number

            # Check registration number validity
            is_valid, user_info = check_registration_number(reg_number)
            if is_valid:
                user_sessions[from_number]["state"] = "processing_payment"
                user_sessions[from_number]["user_info"] = user_info
                response.message(f"✅ Registration number {reg_number} found for {user_info['name']}.\nProceeding to payment...")
                response.message("💵 Payment processing... An STK push has been sent to your number for approval. Please enter your password to proceed with the payment.")
                
                # Simulate M-Pesa STK push
                mpesa_response = simulate_mpesa_stk_push(from_number, 100)  # Assume Ksh 100 payment
                response.message(mpesa_response["message"])
                
                user_sessions[from_number]["state"] = "awaiting_password"
            else:
                response.message(f"❌ Registration number {reg_number} not found. Please check and try again.")
                user_sessions[from_number]["state"] = "awaiting_registration"  # Stay in the same state
        elif user_sessions[from_number]["state"] == "awaiting_password":
            user_sessions[from_number]["password"] = body.strip()
            user_sessions[from_number]["state"] = "completed"
            
            # Retrieve user info for final message
            user_info = user_sessions[from_number].get("user_info", {})
            response.message(f"✅ Payment successful! Thank you, {user_info.get('name', 'User')}.\nHere are your details:\n"
                            f"- Name: {user_info.get('name')}\n"
                            f"- Email: {user_info.get('email')}\n"
                            f"- Phone: {user_info.get('phone')}\n"
                            f"- Membership Level: {user_info.get('membership_level')}")

            # Generate the user info file and get the media URL
            # media_url = generate_user_info_file(user_info, f"user_info_whatsapp_{from_number}")

            # Send the media file via Twilio webhook response
            # response.message("📄 Here is your user info:", media_url=media_url)

            # Clear session after successful transaction
            del user_sessions[from_number]

        else:
            response.message("❓ I'm sorry, I didn't understand that. Please start again by sending your registration number.")
            reg_number = body.strip()
            user_sessions[from_number]["registration_number"] = reg_number

        return response
    except TwilioRestException as e:
        response.message(f"🚨 There was an error processing your request: {str(e)}")
        return response
