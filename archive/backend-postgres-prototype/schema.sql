-- FlyDreamAir Database Schema
-- Run this in psql: psql -U postgres -d flydreamair -f schema.sql

-- Create the database (run this separately as superuser)
-- CREATE DATABASE flydreamair;

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS in_flight_services CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================
-- USERS TABLE
-- =====================
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,  -- stored as bcrypt hash
    loyalty_tier VARCHAR(50) DEFAULT 'Silver Member',
    loyalty_points INTEGER DEFAULT 0,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- =====================
-- FLIGHTS TABLE
-- =====================
CREATE TABLE flights (
    id              SERIAL PRIMARY KEY,
    flight_number   VARCHAR(20) NOT NULL,
    departure_city  VARCHAR(100) NOT NULL,
    arrival_city    VARCHAR(100) NOT NULL,
    departure_time  VARCHAR(10) NOT NULL,   -- e.g. "08:15 AM"
    arrival_time    VARCHAR(10) NOT NULL,   -- e.g. "09:00 PM"
    departure_date  DATE NOT NULL,
    duration        VARCHAR(20) NOT NULL,   -- e.g. "7h 45m"
    price           NUMERIC(10, 2) NOT NULL,
    total_seats     INTEGER DEFAULT 200,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- =====================
-- BOOKINGS TABLE
-- =====================
CREATE TABLE bookings (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,
    flight_id           INTEGER REFERENCES flights(id) ON DELETE CASCADE,
    seat_number         VARCHAR(10),            -- e.g. "12C"
    status              VARCHAR(20) DEFAULT 'confirmed',  -- confirmed, cancelled, completed
    confirmation_code   VARCHAR(20) UNIQUE NOT NULL,
    total_price         NUMERIC(10, 2) DEFAULT 0,
    booked_at           TIMESTAMP DEFAULT NOW()
);

-- =====================
-- IN-FLIGHT SERVICES TABLE
-- =====================
CREATE TABLE in_flight_services (
    id              SERIAL PRIMARY KEY,
    booking_id      INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    service_name    VARCHAR(200) NOT NULL,
    quantity        INTEGER DEFAULT 1,
    unit_price      NUMERIC(10, 2) NOT NULL,
    ordered_at      TIMESTAMP DEFAULT NOW()
);

-- =====================
-- SAMPLE DATA
-- =====================

-- Sample users (passwords are bcrypt hashes of "password123")
INSERT INTO users (name, email, password, loyalty_tier, loyalty_points) VALUES
    ('Alex Stratos', 'alex@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPDT9OfKfePOlBC', 'Platinum Member', 15000),
    ('Jane Doe', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPDT9OfKfePOlBC', 'Silver Member', 2500);

-- Sample flights
INSERT INTO flights (flight_number, departure_city, arrival_city, departure_time, arrival_time, departure_date, duration, price) VALUES
    ('DA-442',  'London (LHR)',      'Tokyo (NRT)',       '11:45 AM', '04:20 PM', '2024-10-24', '12h 35m', 850.00),
    ('FDA-204', 'New York (JFK)',    'London (LHR)',      '08:15 AM', '09:00 PM', '2024-10-24', '7h 45m',  450.00),
    ('FDA-205', 'New York (JFK)',    'London (LHR)',      '11:30 AM', '11:45 PM', '2024-10-24', '7h 15m',  620.00),
    ('FDA-206', 'New York (JFK)',    'London (LHR)',      '07:45 PM', '08:50 AM', '2024-10-24', '8h 05m',  325.00),
    ('SKY-101', 'Los Angeles (LAX)', 'Tokyo (NRT)',       '11:45 AM', '04:20 PM', '2024-10-24', '11h 30m', 920.00),
    ('SKY-102', 'New York (JFK)',    'San Francisco (SFO)', '08:00 AM', '11:15 AM', '2024-11-12', '5h 15m', 380.00),
    ('FDA-301', 'Sydney (SYD)',      'Santorini, Greece',   '09:30 AM', '07:45 PM', '2026-05-22', '20h 15m', 849.00),
    ('FDA-302', 'Sydney (SYD)',      'Santorini, Greece',   '08:00 PM', '06:10 AM', '2026-05-22', '20h 10m', 995.00),
    ('FDA-401', 'Sydney (SYD)',      'Tokyo, Japan',        '10:15 AM', '07:50 PM', '2026-05-20', '9h 35m', 1120.00),
    ('FDA-402', 'Sydney (SYD)',      'Tokyo, Japan',        '09:10 PM', '06:40 AM', '2026-05-20', '9h 30m', 1280.00),
    ('FDA-501', 'Sydney (SYD)',      'Reykjavik, Iceland',  '07:40 AM', '05:30 PM', '2026-05-24', '29h 50m', 645.00),
    ('FDA-502', 'Sydney (SYD)',      'Reykjavik, Iceland',  '10:20 PM', '08:25 AM', '2026-05-24', '30h 05m', 720.00),
    ('FDA-601', 'Sydney (SYD)',      'Banff, Canada',       '11:05 AM', '09:25 AM', '2026-05-26', '16h 20m', 430.00),
    ('FDA-602', 'Sydney (SYD)',      'Banff, Canada',       '06:35 PM', '04:50 PM', '2026-05-26', '16h 15m', 585.00),
    ('FDA-701', 'Sydney (SYD)',      'London (LHR)',        '03:30 PM', '05:55 AM', '2026-05-21', '23h 25m', 980.00),
    ('FDA-702', 'Sydney (SYD)',      'New York (JFK)',      '01:05 PM', '05:10 PM', '2026-05-23', '22h 05m', 1190.00);

-- Sample bookings
INSERT INTO bookings (user_id, flight_id, seat_number, status, confirmation_code, total_price) VALUES
    (1, 5, '12A', 'confirmed', 'FLY-8829-JP', 920.00),
    (1, 6, NULL,  'confirmed', 'SKY-1024-SF', 380.00);
