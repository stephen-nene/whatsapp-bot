# mpesa_integration.py
def simulate_mpesa_stk_push(phone_number: str, amount: float):
    # Simulate a successful M-Pesa STK push response
    return {
        "status": "success",
        "message": f"🔔 A payment request for Ksh {amount} has been sent to your phone ({phone_number}). Please approve the transaction by entering your mpesa pin to complete the payment."
    }
