# FlyDreamAir – Airline Management System

A full-stack airline booking system with HTML/CSS/JS frontend, Python FastAPI backend, and PostgreSQL database.

## Project Structure

```
flydreamair/
├── frontend/
│   ├── css/
│   │   └── style.css          ← All styles
│   ├── js/
│   │   └── main.js            ← Shared JS (API calls, auth helpers)
│   └── pages/
│       ├── index.html         ← Home / Search flights
│       ├── flights.html       ← Flight search results
│       ├── seats.html         ← Seat selection
│       ├── shop.html          ← Sky Market (in-flight services)
│       ├── manage.html        ← My Trips dashboard
│       ├── login.html         ← Sign in
│       └── register.html      ← Create account
└── backend/
    ├── main.py                ← FastAPI application (all routes)
    ├── schema.sql             ← PostgreSQL database schema + sample data
    └── requirements.txt       ← Python dependencies
```

---

## Setup Instructions

### Step 1 – PostgreSQL Database

Make sure PostgreSQL is installed and running.

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE flydreamair;"

# Run the schema (creates tables and inserts sample data)
psql -U postgres -d flydreamair -f backend/schema.sql
```

> **Note:** If your PostgreSQL password is not `postgres`, update `DB_CONFIG` in `backend/main.py`.

---

### Step 2 – Python Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

The API will be available at: **http://localhost:8000**  
Interactive API docs at: **http://localhost:8000/docs**

---

### Step 3 – Frontend

Open the frontend in your browser. The simplest way is to use VS Code's Live Server extension, or run:

```bash
cd frontend/pages
python -m http.server 5500
```

Then open: **http://localhost:5500/pages/index.html**

---

## Sample Accounts

| Email | Password | Role |
|-------|----------|------|
| alex@example.com | password123 | Platinum Member |
| jane@example.com | password123 | Silver Member |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/token` | Login – returns JWT token |
| POST | `/users/register` | Create new account |
| GET | `/users/me` | Get my profile |
| PUT | `/users/me` | Update my profile |
| GET | `/flights` | Search flights (query params: departure_city, arrival_city, date) |
| GET | `/flights/{id}/seats` | Get taken seats for a flight |
| POST | `/bookings` | Create a booking |
| GET | `/bookings/my` | Get all my bookings |
| GET | `/bookings/{id}` | Get one booking |
| PUT | `/bookings/{id}/seat` | Update seat selection |
| PUT | `/bookings/{id}/cancel` | Cancel a booking |
| POST | `/bookings/{id}/services` | Order in-flight services |
| GET | `/bookings/{id}/services` | Get services for a booking |

---

## How It Works

1. **User registers/logs in** → backend returns a JWT token
2. **Frontend stores token** in localStorage and sends it in every request header
3. **User searches flights** → frontend calls `/flights?departure_city=...&arrival_city=...`
4. **User selects a flight** → creates a booking via `POST /bookings`
5. **User picks a seat** → updates via `PUT /bookings/{id}/seat`
6. **User orders services** → shops at Sky Market, calls `POST /bookings/{id}/services`
7. **User manages trips** → views, cancels bookings from the Manage page

---

## Database Tables

- **users** – customer accounts with loyalty info
- **flights** – available flights with prices and times
- **bookings** – flight reservations linking users and flights
- **in_flight_services** – food, drinks, tech items ordered for a booking
