# CampPal – Camping Reservation and Management System

CampPal is a full-stack web application designed to bring campers, campground owners, and system administrators together on a single platform.

The application allows users to discover campgrounds, review available facilities, explore events, make reservations, and manage their bookings. Campground owners can manage their campgrounds, events, reservations, guest check-ins, and operational information through a dedicated management area.

> This project is under active development. Some administrative, payment, notification, and approval features may still be in progress.

---

## Project Purpose

CampPal aims to simplify the camping reservation process and provide campground businesses with a centralized management system.

The platform is designed for three main user groups:

- **Users:** Discover campgrounds and events, make reservations, and manage their bookings.
- **Campground Owners:** Manage campground information, reservations, events, availability, and guest check-in/check-out operations.
- **Administrators:** Supervise the platform, manage users and campground owners, review campground applications, and control system-wide operations.

---

## Main Features

### User Features

Users can:

- Create an account and log in securely
- Browse available campgrounds
- View campground details, facilities, photos, and capacity information
- Browse campground events
- Make campground and event reservations
- View their own reservations
- Cancel eligible reservations
- Track reservation status
- Access reservation details and reservation codes

### Campground Owner Features

Campground owners can:

- Access a dedicated owner dashboard
- Create and manage their campground information
- Create, update, and manage events
- View campground reservations
- View ticket and reservation information
- Search reservations by licence plate
- Search reservations by reservation code
- Confirm guest check-in
- Complete guest check-out
- Update their password
- Access reservation and occupancy information

### Administrator Features

The administrator panel is intended to provide platform-wide control, including:

- Managing users and campground owners
- Creating campground owner accounts
- Reviewing campground applications
- Approving or rejecting campground listings
- Managing campgrounds, events, and reservations
- Monitoring system activity
- Managing platform rules and operational settings

---

## Reservation and Check-In Flow

A typical campground reservation flow works as follows:

1. The user creates an account or logs in.
2. The user browses campgrounds and selects a suitable campground.
3. The user reviews campground details and available dates.
4. The user creates a reservation.
5. The system generates reservation information and a reservation code.
6. The campground owner searches for the reservation using the licence plate or reservation code.
7. The owner confirms the guest's check-in.
8. When the stay is completed, the owner confirms check-out.

Reservation statuses may include:

- `PENDING`
- `CONFIRMED`
- `CANCELLED`
- `CHECKED_IN`
- `CHECKED_OUT`
- `NO_SHOW`

Some status transitions are protected by business rules. For example, a reservation cannot be checked in before the permitted date.

---

## Technology Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite
- JWT authentication
- bcrypt password hashing
- RESTful API architecture
- Zod request validation

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Fetch API

### Development Tools

- Git and GitHub
- npm
- Prisma CLI
- Thunder Client or Postman
- Docker and Docker Compose, where configured

---

## System Architecture

The backend follows a layered architecture:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Prisma ORM
   ↓
Database
```

### Backend Layers

- **Routes:** Define API endpoints and connect requests to controllers.
- **Middleware:** Handles authentication, authorization, validation, and error processing.
- **Controllers:** Receive requests and return HTTP responses.
- **Services:** Contain business rules and database operations.
- **Prisma:** Manages database models, migrations, and queries.

### Frontend Flow

```text
Next.js Page or Component
          ↓
      API Helper
          ↓
   Backend REST API
```

The frontend stores authentication information locally and includes the JWT token in protected API requests.

---

## User Roles

CampPal uses role-based access control.

### `USER`

Regular users can browse campgrounds, view events, create reservations, and manage their own bookings.

### `CAMP_OWNER`

Campground owners can manage their own campground, events, reservations, and guest operations.

### `ADMIN`

Administrators have system-wide management permissions.

Frontend role checks are used to improve the user experience. Actual authorization and ownership controls are enforced by the backend.

---

## Project Structure

The repository is organized into separate backend and frontend applications.

```text
camping-system/
├── camping-system-backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── validators/
│   │   ├── jobs/
│   │   ├── lib/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── camping-system-frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

The exact folder structure may change as development continues.

---

## Environment Variables

Real environment files must not be committed to GitHub.

Create a `.env` file inside the backend folder based on `.env.example`.

Example:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace_with_a_secure_secret"
PORT=5050
```

Create a `.env.local` file inside the frontend folder.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

Depending on the notification configuration, the backend may also require email or SMS provider credentials.

Never commit real passwords, API keys, JWT secrets, email credentials, or SMS provider credentials.

---

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### 2. Start the Backend

```bash
cd camping-system-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The backend normally runs at:

```text
http://localhost:5050
```

### 3. Start the Frontend

Open another terminal:

```bash
cd camping-system-frontend
npm install
npm run dev
```

The frontend normally runs at:

```text
http://localhost:3000
```

---

## Database Setup

The project uses Prisma ORM with SQLite during development.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Depending on the scripts defined in `package.json`, the equivalent Prisma commands may also be run directly:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

The local SQLite database file should not be committed unless the project explicitly requires it.

---

## Authentication

CampPal uses JWT-based authentication.

After login, protected requests include the token in the request header:

```text
Authorization: Bearer <token>
```

The backend verifies:

- Whether the token exists
- Whether the token is valid
- Whether the user has the required role
- Whether the user owns the requested resource

Passwords are stored as bcrypt hashes and are never saved as plain text.

---

## Current Development Areas

The project continues to evolve. Planned or developing features include:

- Full administrator panel
- Campground application and approval workflow
- Payment integration
- Refund and cancellation policies
- Email notifications
- SMS notifications
- Real image and file uploads
- Advanced campground availability management
- Occupancy and sales reports
- Owner performance dashboard
- No-show management
- Improved security and audit logging
- Production deployment configuration

---

## Git and Security Notes

The following files and folders should normally be ignored:

```text
node_modules/
.next/
.env
.env.local
dev.db
*.log
```

Example environment files may be committed:

```text
.env.example
```

Before pushing code to GitHub, verify that no sensitive credentials are included:

```bash
git status
```

---

## Project Status

CampPal is currently being developed as a scalable camping discovery, reservation, and campground management platform.

The current system includes core authentication, role-based access, campground and event functionality, reservation management, and campground check-in/check-out operations. Additional administration, payment, notification, and reporting modules are planned as the project develops.

---

## License

A licence has not yet been defined for this project. All rights are reserved unless a licence file is added to the repository.
