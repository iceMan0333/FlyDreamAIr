# FlyDreamAir

FlyDreamAir is a browser-based airline booking system built with HTML, CSS, and JavaScript. The current version runs as a static frontend from `index.html` and uses browser storage to keep booking details available across the booking flow.

The application covers the main steps of a flight booking experience, from searching destinations to selecting flights, confirming passenger details, choosing seats and onboard services, completing payment, and viewing a receipt.

## Features

- Homepage with destination search and trending destinations
- Flight selection page with generated flight options
- Passenger confirmation page
- Seat selection and onboard services pages
- Card payment and booking receipt flow
- Sign up, login, profile, and manage booking pages
- Browser-based demo state using `sessionStorage` and `localStorage`

## Running the Project

Open `index.html` in a browser to start from the homepage.

The current version does not require a server, database, API key, package installation, or backend deployment.

## Version History

| Tag | Stage | Summary |
| --- | --- | --- |
| `v0.1-ui-prototype` | 01 early frontend | Built the first booking pages and navigation prototype. |
| `v0.2-frontend-expanded` | 02 expanded frontend | Expanded the frontend flow and added browser storage for demo booking data. |
| `v0.3-backend-postgres` | 03 backend postgres | Added PostgreSQL schema work and a FastAPI backend prototype for users, flights, bookings, seats, and services. |
| `v0.4-integration-attempt` | 04 integration attempt | Connected the frontend booking flow with backend API work during integration. |
| `v1.0-final-submission` | 05 final version | Finalized the simplified static version and kept earlier backend work archived. |

Database development began around 23 April, followed by API development, integration work, and final frontend simplification.

## Backend Archive

Earlier FastAPI and PostgreSQL work is kept in `archive/backend-postgres-prototype/`.

That archive is included to preserve the backend development stage, but it is not needed to run the current static version.
