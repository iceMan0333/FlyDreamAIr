# FlyDreamAir

FlyDreamAir is a student airline booking prototype created for the T17 project submission. The final submitted version is a static HTML, CSS, and JavaScript demo that runs from `index.html` and stores demo booking data in browser storage.

The project originally planned to use a FastAPI backend with PostgreSQL. That backend work was built during the middle of the project, but the final report explains that the team re-baselined the submission to a simpler static frontend because of late integration risk and resource constraints.

## Final Demo

Open `index.html` in a browser to start the demo from the homepage.

Main final-version features:

- homepage with destination search and trending destinations
- flight selection flow
- passenger confirmation
- seat selection and onboard services
- card payment summary and receipt
- sign up, login, profile, and manage booking demo pages
- local `sessionStorage` and `localStorage` for demo state

No server, database, API key, or package installation is required for the final submitted version.

## Project History

This repository was reconstructed from archived project snapshots so the Git history shows the development story described in the final report and weekly reports.

| Tag | Stage | Summary |
| --- | --- | --- |
| `v0.1-ui-prototype` | 01 early frontend | First simple HTML/JS booking pages and navigation prototype. |
| `v0.2-frontend-expanded` | 02 expanded frontend | Expanded static frontend flow using browser storage for demo data. |
| `v0.3-backend-postgres` | 03 backend postgres | PostgreSQL schema and FastAPI backend prototype for users, flights, bookings, seats, and services. |
| `v0.4-integration-attempt` | 04 integration attempt | Frontend and backend integration attempt with API-connected booking flow. |
| `v1.0-final-submission` | 05 final version | Final simplified static submission with backend work archived. |

The weekly report shows that database development started in week 4, beginning around 23 April. The reconstructed commits use dates based on that project timeline.

## Backend Archive

The non-final FastAPI and PostgreSQL work is kept in `archive/backend-postgres-prototype/`.

That folder is included for assessment evidence only. It is not required to run the final demo.

## Running the Final Version

1. Open `index.html`.
2. Use the homepage search or destination cards to begin the booking flow.
3. Continue through flight selection, confirmation, seat/services, payment, and receipt pages.

Because the final version is static, refreshing or clearing browser storage may reset demo booking information.
