# Fly-DreamAir

## Simplified Assignment Version

This version keeps the same front-end pages, styling, and navigation, but strips down the backend/database requirements so the project is easier to run and present for the assignment.

What was simplified:
- Removed the external city-search API key and replaced it with a local city suggestion list in `homepage/js/script.js`.
- Removed the runtime JSON fetch for booking-change seat availability and placed the demo seat data directly inside `bookingchanges/js/bk.js`.
- Kept browser `sessionStorage` for passing booking, passenger, seat, service, and payment summary details between pages.
- No server, database setup, API key, package installation, or backend deployment is required.

Reason for simplification:
The original backend/database/API approach caused integration issues and was more complex than needed for the assignment scope, so the project was reduced to a working front-end prototype with local demo data.
