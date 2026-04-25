import stripe
from app.core.config import settings

# Initialize the modern StripeClient for V2 and V1 requests
if not settings.STRIPE_API_KEY or settings.STRIPE_API_KEY == "sk_test_...":
    # Providing a helpful error if the key is missing or still the placeholder
    raise ValueError("STRIPE_API_KEY is not configured in your .env file. Please add a valid Stripe secret key.")

stripeClient = stripe.StripeClient(settings.STRIPE_API_KEY)
