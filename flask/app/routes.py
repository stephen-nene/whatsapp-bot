import os
from flask import Blueprint, jsonify
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

main = Blueprint('main', __name__)

@main.route('/send-test-message', methods=['GET'])
def send_test_message():
    # Twilio credentials from environment
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
    my_number = os.getenv('MY_PHONE_NUMBER')
    print(f"Account SID: {account_sid},{my_number} Auth Token: {auth_token[:4]}***")

    # Initialize Twilio client
    client = Client(account_sid, auth_token)

    try:
        # Send WhatsApp message
        message = client.messages.create(
            # content_sid="HX83abd9e8f85e5fd94ad317d30dfab3af",
            # content_variables='{"1":"12/1"}',
            body="Hello! This is a test message from your Flask app using Twilio.",
            from_=twilio_number,
            to="whatsapp:+254791067727"
        )
        return jsonify({"status": "success", "message_sid": message.sid})
    except Exception as e:
        return jsonify({"status": "failed", "error": str(e)}), 500
