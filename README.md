\# LogiTrack - Shipment Management System



A full-stack web application to create, track, and manage shipments from pickup to delivery. Built with React, NestJS, Prisma, and MySQL.



\## Features



\- \*\*Authentication:\*\* Register and login with JWT, password hashing with bcrypt

\- \*\*Role-based access:\*\* ADMIN, MANAGER, and DRIVER roles with route guards

\- \*\*Shipment management:\*\* Create shipments (from city, to city, weight, value, items), view with filters and pagination

\- \*\*Status workflow:\*\* PENDING → IN\_TRANSIT → DELIVERED (or FAILED / CANCELLED) with validated transitions

\- \*\*Tracking history:\*\* Every status change is recorded with location, notes, and the user who made it

\- \*\*Driver assignment:\*\* Assign a driver to a shipment

\- \*\*Dashboard:\*\* Totals, status breakdown, delivery metrics, and recent shipments



\## Tech Stack



| Layer     | Technology                              |

|-----------|-----------------------------------------|

| Frontend  | React, React Router, Axios              |

| Backend   | NestJS, Passport JWT, class-validator   |

| Database  | MySQL with Prisma ORM (v5)              |

| Auth      | JWT, bcrypt                             |



\## Project Structure

