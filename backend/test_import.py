try:
    from app.infrastructure.stripe_client import stripeClient
    print("Import successful!")
except ImportError as e:
    print(f"Import failed: {e}")
    import sys
    print(f"Python path: {sys.path}")
    import os
    print(f"Current directory: {os.getcwd()}")
    print(f"Directory listing: {os.listdir('.')}")
    if os.path.exists('app'):
        print(f"app directory exists. Contents: {os.listdir('app')}")
        if os.path.exists('app/infrastructure'):
            print(f"app/infrastructure exists. Contents: {os.listdir('app/infrastructure')}")
