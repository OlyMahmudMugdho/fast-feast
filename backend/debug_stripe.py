import stripe
from app.core.config import settings
from app.infrastructure.stripe_client import stripeClient
import json

account_id = "acct_1TPyhWRp2pcZ68LI"

try:
    account = stripeClient.v2.core.accounts.retrieve(
        account_id,
        params={"include": ["configuration.merchant", "requirements"]}
    )
    
    # Debugging exact capability and requirement status
    print(json.dumps({
        "account_id": account.id,
        "capabilities": {
            "card_payments": account.configuration.merchant.capabilities.card_payments.status if account.configuration and account.configuration.merchant else "missing"
        },
        "requirements": {
            "status": account.requirements.summary.minimum_deadline.status if account.requirements and account.requirements.summary.minimum_deadline else "no_deadline"
        }
    }, indent=2))
except Exception as e:
    print(f"Error: {e}")
