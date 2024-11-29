from dotenv import load_dotenv
import os
import datetime
import base64
import requests

# Load .env file
load_dotenv()

# Fetch credentials from environment variables
CONSUMER_KEY = os.getenv("CONSUMER_KEY")
CONSUMER_SECRET = os.getenv("CONSUMER_SECRET")
SHORTCODE = os.getenv("SHORTCODE")
PASSKEY = os.getenv("PASSKEY")

def get_access_token():
    """
    Fetches the access token from Safaricom's API.
    """
    try:
        # Safaricom sandbox endpoint
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        
        # Authenticate with consumer key and secret
        response = requests.get(url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
        response.raise_for_status()
        
        # Parse and return the access token
        data = response.json()
        return data["access_token"]
    except Exception as e:
        raise Exception(f"Error fetching access token: {str(e)}")
def simulate_mpesa_stk_push(phone_number: str, amount: float):
    """
    Sends an STK push request using Safaricom's sandbox API.
    """
    try:
        access_token = get_access_token()
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }

        # Sandbox credentials
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode(f"{SHORTCODE}{PASSKEY}{timestamp}".encode()).decode()

        payload = {
            "BusinessShortCode": SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": SHORTCODE,
            "PhoneNumber": phone_number,
            "CallBackURL": "https://yourdomain.com/mpesa-callback",  # Replace with your actual callback URL
            "AccountReference": "Order12345",
            "TransactionDesc": "Test Payment"
        }

        response = requests.post(
            f"https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        return response.json()

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
