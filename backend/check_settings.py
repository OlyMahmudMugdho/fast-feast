from app.core.config import settings
import os

print(f"--- Configuration Debug ---")
print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
print(f"STRIPE_SUCCESS_URL: {settings.STRIPE_SUCCESS_URL}")
print(f"STRIPE_CANCEL_URL: {settings.STRIPE_CANCEL_URL}")
print(f"STRIPE_API_KEY set: {bool(settings.STRIPE_API_KEY)}")

# Check environment variables directly
print(f"\n--- Environment Variables ---")
print(f"ENV FRONTEND_URL: {os.environ.get('FRONTEND_URL')}")
print(f"ENV STRIPE_SUCCESS_URL: {os.environ.get('STRIPE_SUCCESS_URL')}")
