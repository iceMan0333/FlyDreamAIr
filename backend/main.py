# main.py - FlyDreamAir Backend API
# Run with: uvicorn main:app --reload

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import psycopg2
import psycopg2.extras
import bcrypt
import jwt
import random
import string
from datetime import datetime, timedelta

# ===========================
# APP SETUP
# ===========================

app = FastAPI(title="FlyDreamAir API")

# Allow the frontend (running on any port locally) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # In production, restrict this to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT settings
SECRET_KEY = "flydreamair-secret-key-change-in-production"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ===========================
# DATABASE CONNECTION
# ===========================

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "flydreamair",
    "user": "postgres",
    "password": "postgres"   # Change this to your PostgreSQL password
}

def get_db():
    """Connect to PostgreSQL and return a cursor."""
    conn = psycopg2.connect(**DB_CONFIG)
    try:
        # Use RealDictCursor so results come back as dictionaries
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        yield conn, cursor
    finally:
        conn.close()


# ===========================
# PYDANTIC MODELS (request/response shapes)
# ===========================

class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

class BookingCreate(BaseModel):
    flight_id: int

class SeatUpdate(BaseModel):
    seat_number: str

class ServiceItem(BaseModel):
    service_name: str
    quantity: int
    unit_price: float

class ServicesOrder(BaseModel):
    items: List[ServiceItem]


# ===========================
# HELPER FUNCTIONS
# ===========================

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password: str, hashed: str) -> bool:
    """Check if a plain password matches a bcrypt hash."""
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: int) -> str:
    """Create a JWT token for a user."""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> int:
    """Decode a JWT token and return the user ID."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired, please log in again")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_confirmation_code() -> str:
    """Generate a random booking confirmation code like FLY-1234-AB."""
    letters = "".join(random.choices(string.ascii_uppercase, k=2))
    numbers = "".join(random.choices(string.digits, k=4))
    return f"FLY-{numbers}-{letters}"

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    """Extract and validate user ID from token (used as a dependency)."""
    return decode_token(token)

def calculate_seat_fee(seat_number: str) -> float:
    """Mirror the frontend seat pricing rules so booking totals stay correct."""
    try:
        row = int(''.join(ch for ch in seat_number if ch.isdigit()))
        col = ''.join(ch for ch in seat_number if ch.isalpha()).upper()
    except ValueError:
        return 0.0
    if row <= 5:
        return 45.0
    if col in {"A", "G"}:
        return 25.0
    return 0.0


# ===========================
# AUTH ROUTES
# ===========================

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)):
    """Login with email and password. Returns a JWT token."""
    conn, cursor = db

    cursor.execute("SELECT * FROM users WHERE email = %s", (form.username,))
    user = cursor.fetchone()

    if not user or not check_password(form.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_token(user["id"])
    return {"access_token": token, "token_type": "bearer"}


# ===========================
# USER ROUTES
# ===========================

@app.post("/users/register", status_code=201)
def register(data: UserRegister, db=Depends(get_db)):
    """Register a new user account."""
    conn, cursor = db

    # Check if email is already taken
    cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = hash_password(data.password)
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s) RETURNING id",
        (data.name, data.email, hashed)
    )
    conn.commit()
    return {"message": "Account created successfully"}


@app.get("/users/me")
def get_my_profile(user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Get the currently logged-in user's profile."""
    conn, cursor = db

    cursor.execute(
        "SELECT id, name, email, loyalty_tier, loyalty_points, created_at FROM users WHERE id = %s",
        (user_id,)
    )
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(user)


@app.put("/users/me")
def update_my_profile(data: UserUpdate, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Update the logged-in user's profile."""
    conn, cursor = db

    updates = []
    values = []

    if data.name:
        updates.append("name = %s")
        values.append(data.name)
    if data.email:
        updates.append("email = %s")
        values.append(data.email)
    if data.password:
        updates.append("password = %s")
        values.append(hash_password(data.password))

    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")

    values.append(user_id)
    cursor.execute(
        f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
        values
    )
    conn.commit()
    return {"message": "Profile updated"}


# ===========================
# FLIGHT ROUTES
# ===========================

@app.get("/flights")
def search_flights(
    departure_city: Optional[str] = None,
    arrival_city: Optional[str] = None,
    date: Optional[str] = None,
    db=Depends(get_db)
):
    """Search available flights by city and date."""
    conn, cursor = db

    query = "SELECT * FROM flights WHERE 1=1"
    params = []

    if departure_city:
        query += " AND LOWER(departure_city) LIKE %s"
        params.append(f"%{departure_city.lower()}%")
    if arrival_city:
        query += " AND LOWER(arrival_city) LIKE %s"
        params.append(f"%{arrival_city.lower()}%")
    if date:
        query += " AND departure_date = %s"
        params.append(date)

    query += " ORDER BY price ASC"

    cursor.execute(query, params)
    flights = cursor.fetchall()
    return [dict(f) for f in flights]


@app.get("/flights/{flight_id}/seats")
def get_taken_seats(flight_id: int, db=Depends(get_db)):
    """Get list of taken seat numbers for a flight."""
    conn, cursor = db

    cursor.execute(
        "SELECT seat_number FROM bookings WHERE flight_id = %s AND seat_number IS NOT NULL AND status != 'cancelled'",
        (flight_id,)
    )
    taken = [row["seat_number"] for row in cursor.fetchall()]
    return {"taken_seats": taken}


# ===========================
# BOOKING ROUTES
# ===========================

@app.post("/bookings", status_code=201)
def create_booking(data: BookingCreate, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Create a new flight booking."""
    conn, cursor = db

    # Check the flight exists
    cursor.execute("SELECT * FROM flights WHERE id = %s", (data.flight_id,))
    flight = cursor.fetchone()
    if not flight:
        raise HTTPException(status_code=404, detail="Flight not found")

    # Generate a unique confirmation code
    code = generate_confirmation_code()

    cursor.execute(
        """INSERT INTO bookings (user_id, flight_id, confirmation_code, total_price, status)
           VALUES (%s, %s, %s, %s, 'confirmed') RETURNING id""",
        (user_id, data.flight_id, code, flight["price"])
    )
    booking_id = cursor.fetchone()["id"]
    conn.commit()

    return {"id": booking_id, "confirmation_code": code, "message": "Booking created"}


@app.get("/bookings/my")
def get_my_bookings(user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Get all bookings for the current user."""
    conn, cursor = db

    cursor.execute("""
        SELECT 
            b.id, b.flight_id, b.seat_number, b.status, b.confirmation_code, 
            b.total_price, b.booked_at,
            f.flight_number, f.departure_city, f.arrival_city,
            f.departure_time, f.arrival_time, f.departure_date
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        WHERE b.user_id = %s
        ORDER BY f.departure_date ASC
    """, (user_id,))

    bookings = cursor.fetchall()
    return [dict(b) for b in bookings]


@app.get("/bookings/{booking_id}")
def get_booking(booking_id: int, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Get details of a specific booking."""
    conn, cursor = db

    cursor.execute("""
        SELECT 
            b.*, f.flight_number, f.departure_city, f.arrival_city,
            f.departure_time, f.arrival_time, f.departure_date
        FROM bookings b
        JOIN flights f ON b.flight_id = f.id
        WHERE b.id = %s AND b.user_id = %s
    """, (booking_id, user_id))

    booking = cursor.fetchone()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return dict(booking)


@app.put("/bookings/{booking_id}/seat")
def update_seat(booking_id: int, data: SeatUpdate, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Select or update a seat for a booking."""
    conn, cursor = db

    # Check this booking belongs to the user
    cursor.execute("SELECT * FROM bookings WHERE id = %s AND user_id = %s", (booking_id, user_id))
    booking = cursor.fetchone()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Check seat isn't already taken on this flight
    cursor.execute(
        "SELECT id FROM bookings WHERE flight_id = %s AND seat_number = %s AND id != %s AND status != 'cancelled'",
        (booking["flight_id"], data.seat_number, booking_id)
    )
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="Seat already taken")

    old_fee = calculate_seat_fee(booking["seat_number"]) if booking.get("seat_number") else 0.0
    new_fee = calculate_seat_fee(data.seat_number)
    fee_difference = new_fee - old_fee

    cursor.execute(
        "UPDATE bookings SET seat_number = %s, total_price = total_price + %s WHERE id = %s",
        (data.seat_number, fee_difference, booking_id)
    )
    conn.commit()
    return {"message": f"Seat {data.seat_number} confirmed", "seat_fee": new_fee}


@app.put("/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Cancel a booking."""
    conn, cursor = db

    cursor.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id = %s AND user_id = %s",
        (booking_id, user_id)
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    conn.commit()
    return {"message": "Booking cancelled"}


# ===========================
# IN-FLIGHT SERVICES ROUTES
# ===========================

@app.post("/bookings/{booking_id}/services", status_code=201)
def order_services(booking_id: int, data: ServicesOrder, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Order in-flight services for a booking."""
    conn, cursor = db

    # Verify booking ownership
    cursor.execute("SELECT id FROM bookings WHERE id = %s AND user_id = %s", (booking_id, user_id))
    if not cursor.fetchone():
        raise HTTPException(status_code=404, detail="Booking not found")

    if not data.items:
        raise HTTPException(status_code=400, detail="No service items supplied")

    # Insert each service item
    for item in data.items:
        cursor.execute(
            "INSERT INTO in_flight_services (booking_id, service_name, quantity, unit_price) VALUES (%s, %s, %s, %s)",
            (booking_id, item.service_name, item.quantity, item.unit_price)
        )

    # Update total price
    total_services = sum(item.quantity * item.unit_price for item in data.items)
    cursor.execute(
        "UPDATE bookings SET total_price = total_price + %s WHERE id = %s",
        (total_services, booking_id)
    )
    conn.commit()
    return {"message": f"{len(data.items)} service(s) ordered successfully"}


@app.get("/bookings/{booking_id}/services")
def get_booking_services(booking_id: int, user_id: int = Depends(get_current_user_id), db=Depends(get_db)):
    """Get all in-flight services for a booking."""
    conn, cursor = db

    cursor.execute(
        "SELECT * FROM in_flight_services WHERE booking_id = %s ORDER BY ordered_at ASC",
        (booking_id,)
    )
    services = cursor.fetchall()
    return [dict(s) for s in services]


# ===========================
# ROOT ROUTE (health check)
# ===========================

@app.get("/")
def root():
    return {"message": "FlyDreamAir API is running ✈️", "docs": "/docs"}
