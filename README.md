# LogiTrack - Shipment Management System

A full-stack web application to create, track, and manage shipments from pickup to delivery. Built with React, NestJS, Prisma, and MySQL.

## Features

- Authentication: register and login with JWT, password hashing with bcrypt
- Role-based access: ADMIN, MANAGER, and DRIVER roles with route guards
- Shipment management: create shipments (from city, to city, weight, value, items) with pagination and status filter
- Status workflow: PENDING → IN_TRANSIT → DELIVERED (or FAILED / CANCELLED) with validated transitions
- Tracking history: every status change is recorded with location, notes, and the user who made it
- Driver assignment: assign a driver to a shipment
- Dashboard: totals, status breakdown, delivery metrics, and recent shipments

## Tech Stack

- Frontend: React, React Router, Axios
- Backend: NestJS, Passport JWT, class-validator
- Database: MySQL with Prisma ORM (v5)
- Auth: JWT, bcrypt

## Project Structure

- backend/: NestJS REST API (prisma, src/auth, src/shipments, src/tracking, src/dashboard)
- frontend/: React app (src/components, src/services, src/hooks, src/utils)

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- npm

### Backend

Open a terminal in the `backend` folder:

    cd backend
    npm install

Create a `.env` file in the backend folder (see `.env.example`), then run:

    npx prisma migrate dev --name init
    npm run start:dev

The API runs on http://localhost:3001

### Frontend

Open a second terminal in the `frontend` folder:

    cd frontend
    npm install
    npm start

The app runs on http://localhost:3000

## Author

Hadia Qadeer

GitHub: https://github.com/hadia-qadeer