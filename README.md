\# LogiTrack - Shipment Management System



A full-stack web application to create, track, and manage shipments from pickup to delivery. Built with React, NestJS, Prisma, and MySQL.



\## Features



\- Authentication: register and login with JWT, password hashing with bcrypt

\- Role-based access: ADMIN, MANAGER, and DRIVER roles with route guards

\- Shipment management: create shipments (from city, to city, weight, value, items) with pagination and status filter

\- Status workflow: PENDING → IN\_TRANSIT → DELIVERED (or FAILED / CANCELLED) with validated transitions

\- Tracking history: every status change is recorded with location, notes, and the user who made it

\- Driver assignment: assign a driver to a shipment

\- Dashboard: totals, status breakdown, delivery metrics, and recent shipments



\## Tech Stack



\- Frontend: React, React Router, Axios

\- Backend: NestJS, Passport JWT, class-validator

\- Database: MySQL with Prisma ORM (v5)

\- Auth: JWT, bcrypt



\## Project Structure



LogiTrack/

\- backend/ NestJS REST API (prisma, src/auth, src/shipments, src/tracking, src/dashboard)

\- frontend/ React app (src/components, src/services, src/hooks, src/utils)



\## Getting Started



\### Prerequisites



\- Node.js 18+

\- MySQL 8.0+

\- npm



\### Backend



cd backend

npm install



Create a `.env` file in the backend folder (see `.env.example`), then run:



npx prisma migrate dev --name init

npm run start:dev



API runs on http://localhost:3001



\### Frontend



cd frontend

npm install

npm start



App runs on http://localhost:3000



\## Author



Hadia Qadeer

GitHub: https://github.com/hadia-qadeer



Note: Ye version jaan boojh kar code blocks aur tables kam use karta hai taake render masla na ho. Roadmap section hata diya hai, kyunki woh incomplete features ko dikhata tha.



\## Step 3: Save aur push karein



`Ctrl + S` dabayein, Notepad band karein, phir:



```powershell

git add README.md

git commit -m "Rewrite README"

git push

```



Phir GitHub page refresh karein (F5). Agar ab bhi kuch theek nahi lag raha, to screenshot bhejein, aur batayein kaunsa hissa ghalat dikh raha hai.

