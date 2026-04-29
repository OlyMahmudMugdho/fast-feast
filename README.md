# Fast-Feast

**Fast-Feast** is a high-performance, multi-vendor food marketplace platform designed to bridge the gap between local restaurants and hungry customers. Built with a modern, decoupled architecture, it provides a seamless experience across web and mobile interfaces.

---

## Key Features

### For Buyers
*   **Discovery:** Browse local restaurants and featured dishes with rich visual previews.
*   **Seamless Ordering:** Dynamic cart management and multi-method checkout (Stripe & COD).
*   **Order Tracking:** Real-time updates on order status from preparation to delivery.
*   **Account Management:** Secure profile and address management.

### For Shop Owners
*   **Vendor Onboarding:** Streamlined registration and automated financial setup via **Stripe Connect Express**.
*   **Menu Management:** Intuitive tools to manage food categories, items, pricing, and availability.
*   **Analytics Dashboard:** Visual insights into revenue, order volume, and customer ratings.
*   **Staff Management:** Roles for owners and employees to manage daily operations.

### For Platform Admins
*   **Vendor Verification:** Centralized workflow to review and approve/reject new shop applications.
*   **Platform Analytics:** High-level monitoring of total volume, earnings, and user growth.
*   **System Health:** Real-time monitoring of backend services and payment gateways.

---

## Technology Stack

### **Backend (API)**
*   **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.13)
*   **Database:** PostgreSQL with [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
*   **Migrations:** [Alembic](https://alembic.sqlalchemy.org/)
*   **Payments:** [Stripe Connect](https://stripe.com/connect) (Express Payouts)
*   **Media:** [Cloudinary](https://cloudinary.com/) for image hosting
*   **Auth:** JWT-based secure authentication

### **Web Frontend**
*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
*   **UI Library:** [Ant Design](https://ant.design/)
*   **Styling:** Tailwind CSS & Vanilla CSS
*   **State:** React Context API

### **Mobile App**
*   **Framework:** [Flutter](https://flutter.dev/) (Dart)
*   **State Management:** [Provider](https://pub.dev/packages/provider)
*   **Persistence:** Shared Preferences
*   **Networking:** Custom HTTP client with JWT interceptors

---

## Project Structure

```text
fast-feast/
├── backend/          # FastAPI application, migrations, and seed scripts
├── frontend/         # Next.js web application (Admin/Shop/Buyer dashboards)
├── mobile/           # Flutter cross-platform mobile application
├── plans/            # Roadmap and architectural documentation
└── scripts/          # Utility and testing scripts
```

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
# Install dependencies (using uv)
uv sync
# Configure environment
cp .env.example .env  # Fill in your DB, Stripe, and Cloudinary keys
# Run migrations
alembic upgrade head
# Start the server
python main.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Mobile Setup
```bash
cd mobile
flutter pub get
flutter run
```

---

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Created for the Foodie Community.
