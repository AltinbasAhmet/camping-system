# Event Booking & Ticketing System

This project is a full-stack web application developed for the SNG346 Web Application Development semester project.

The selected project option is:

**Option 2: Event Booking & Ticketing System**

The system allows organisers to create and manage events, while attendees can browse events and book tickets. It includes authentication, role-based authorisation, event management, booking management, organiser dashboard, frontend integration, and Docker-based deployment.

---

## Team Members

- Student Name: Sıla Öztürk  
  Student ID: 2587483

- Student Name: Ahmet Altınbaş  
  Student ID: 2586345

---

## Tech Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite
- JWT authentication
- RESTful API
- bcrypt for password hashing

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Fetch API

### Deployment

- Docker
- Docker Compose

---

## Architecture Overview

The project follows a layered architecture to keep concerns cleanly separated across both the backend and the frontend.

### Backend Architecture

The backend is a Node.js + Express.js REST API structured in four layers:

```
Request → Route → Middleware → Controller → Service → Prisma (Database)
```

**Routes** (`src/routes/`) define the URL paths and attach the appropriate middleware and controller functions.

**Middleware** (`src/middlewares/`) handles cross-cutting concerns before the request reaches the controller:
- `auth.middleware.js` — verifies the JWT token from the `Authorization` header and attaches the decoded user (`id`, `role`) to `req.user`.
- `role.middleware.js` — checks that `req.user.role` matches the role(s) required by the route.
- `validate.middleware.js` — runs Zod schema validation on the request body and returns a 400 error if validation fails.
- `error.middleware.js` — global error handler that catches any unhandled errors and returns a consistent JSON error response.

**Controllers** (`src/controllers/`) receive the validated request, extract what they need (params, body, `req.user`), call the relevant service function, and send the HTTP response.

**Services** (`src/services/`) contain all business logic and database interaction via Prisma. This is where rules like overbooking prevention, ownership checks, and capacity validation are enforced.

**Prisma** (`prisma/schema.prisma`) manages the database schema, migrations, and query execution against a SQLite database.

### Frontend Architecture

The frontend is a Next.js application using the App Router.

```
Page (app/) → lib/api.ts (fetch wrapper) → Backend REST API
```

**Pages** (`app/`) are React components that fetch data on mount and manage local state for loading, errors, and success messages.

**`lib/api.ts`** is a shared `apiRequest()` wrapper around `fetch` that automatically attaches the JWT token from `localStorage` to the `Authorization` header for protected requests.

**`lib/auth.ts`** provides helpers for reading and writing the authenticated user and token to/from `localStorage` (`saveAuth`, `getUser`, `getToken`, `logout`).

**Components** (`components/`) hold reusable UI pieces such as `EventCard` and `Navbar`.

### Data Flow Example — Booking a Ticket

1. Attendee clicks "Book Ticket" on the event detail page.
2. The frontend calls `POST /bookings` via `apiRequest()`, which includes the JWT in the header.
3. `auth.middleware` verifies the token and populates `req.user`.
4. `role.middleware` confirms the user is an `ATTENDEE`.
5. `validate.middleware` checks that `eventId` is present and is a number.
6. `BookingController.createBooking` calls `BookingService.createBooking(userId, eventId)`.
7. The service checks the event exists, checks remaining capacity, checks for a duplicate booking, then calls `prisma.booking.create()`.
8. The backend returns `201` with the booking object.
9. The frontend shows a success message and refreshes the event details.

---

## Database Design

The project uses Prisma ORM with SQLite.

### Models

**User**

| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key, auto-increment |
| name | String | |
| email | String | Unique |
| password | String | bcrypt hashed |
| role | Role (enum) | `ORGANISER` or `ATTENDEE` |
| createdAt | DateTime | |

**Event**

| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key, auto-increment |
| title | String | |
| description | String | |
| dateTime | DateTime | Must be a future date |
| capacity | Int | Minimum 1 |
| organiserId | Int | Foreign key → User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Booking**

| Field | Type | Notes |
|---|---|---|
| id | Int | Primary key, auto-increment |
| userId | Int | Foreign key → User |
| eventId | Int | Foreign key → Event |
| bookedAt | DateTime | |

A unique constraint on `(userId, eventId)` enforces that one attendee cannot book the same event twice at the database level.

### Relationships

- A `User` with role `ORGANISER` can create many `Event` records.
- A `User` with role `ATTENDEE` can create many `Booking` records.
- An `Event` can have many `Booking` records.
- A `Booking` belongs to exactly one `User` and one `Event`.

---

## Main Features

### Authentication

- User registration
- User login
- Password hashing
- JWT-based authentication
- Protected backend routes

### User Roles

The system has two user roles:

- **Organiser**
- **Attendee**

### Organiser Features

Organisers can:

- Create events
- Update their own events
- Delete their own events
- View organiser dashboard
- View number of tickets sold
- View attendee list for each event

### Attendee Features

Attendees can:

- View all events
- View event details
- Book tickets
- View their own bookings

### Booking Rules

The system:

- Prevents duplicate bookings (enforced at both the database level via a unique constraint on `userId + eventId`, and at the service layer)
- Prevents overbooking (checks remaining capacity before creating a booking)
- Validates event capacity
- Allows only attendees to book tickets

### Role-Based UI Behaviour

The frontend changes based on the logged-in user's role:

- Attendees see booking options.
- Organisers see dashboard and event management options.
- Organisers can only edit/delete their own events.
- Other organisers can view public event details but cannot update or delete events they do not own.

---

## Bonus Features Implemented

The following bonus features from the project specification have been implemented:

### Search and Filtering

The `GET /events` endpoint supports the following optional query parameters:

| Parameter | Description |
|---|---|
| `search` | Filters events by title or description (case-insensitive substring match) |
| `capacity` | Returns only events with capacity greater than or equal to the given number |
| `sort` | Sorts events by date — `asc` (default) or `desc` |

These filters can be combined. The events page in the frontend exposes all three as form inputs.

### Pagination

The `GET /events` endpoint supports cursor-based pagination via `page` and `limit` query parameters.

| Parameter | Default | Description |
|---|---|---|
| `page` | 1 | The page number to retrieve |
| `limit` | 5 | The number of events per page |

The response includes `total`, `totalPages`, `page`, and `limit` fields alongside the data array.

---

## Project Requirements Covered

### Backend Requirements

- RESTful API design
- Proper route structure
- Prisma ORM models
- Relational database models
- Input validation
- JWT authentication
- Role-based authorisation
- Error handling
- Prisma migrations
- Seed script
- Async/await usage
- Proper HTTP status codes
- Separation of concerns using routes, controllers, services, and middleware

### Frontend Requirements

- Next.js frontend
- React components
- API integration using fetch
- Protected pages
- Role-based UI behaviour
- Form validation
- Responsive layout with Tailwind CSS
- Loading states
- Error and success feedback

### Deployment Requirements

- Dockerfile for backend
- Dockerfile for frontend
- Docker Compose configuration
- Environment variables
- Production build support

---

## Project Structure

```txt
event-booking-main/
  README.md
  docker-compose.yml
  .gitignore

  event-booking-backend/
    Dockerfile
    .dockerignore
    .env.example
    package.json
    prisma/
      schema.prisma
      migrations/
      seed.js
    src/
      controllers/
        auth.controller.js
        event.controller.js
        booking.controller.js
      routes/
        auth.routes.js
        event.routes.js
        booking.routes.js
      services/
        auth.service.js
        event.service.js
        booking.service.js
      middlewares/
        auth.middleware.js
        role.middleware.js
        validate.middleware.js
        error.middleware.js
      validators/
        auth.validator.js
        event.validator.js
        booking.validator.js
      lib/
        prisma.js
      utils/
        AppError.js
      app.js
      server.js

  event-booking-frontend/
    Dockerfile
    .dockerignore
    .env.example
    package.json
    next.config.ts
    app/
      page.tsx
      layout.tsx
      events/
        page.tsx
        [id]/page.tsx
      my-bookings/
        page.tsx
      login/
        page.tsx
      register/
        page.tsx
      organiser/
        dashboard/page.tsx
        events/
          new/page.tsx
          [id]/edit/page.tsx
    components/
      EventCard.tsx
      Navbar.tsx
    lib/
      api.ts
      auth.ts
```

---

## Environment Variables

Real `.env` files are not committed to the repository. Instead, `.env.example` files are provided to show the required environment variables.

### Backend Environment Variables

Create a `.env` file inside `event-booking-backend`:

```bash
cd event-booking-backend
cp .env.example .env
```

Example backend `.env`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="change_this_secret"
PORT=5050
```

### Frontend Environment Variables

Create a `.env.local` file inside `event-booking-frontend`:

```bash
cd event-booking-frontend
cp .env.example .env.local
```

Example frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

### Note About Docker

When running the project with Docker Compose, the necessary environment variables are already defined inside `docker-compose.yml`.

Therefore, Docker users can run the project without manually creating `.env` files.

---

## Required Software

To run the project locally, install:

- Node.js
- npm
- Docker Desktop
- Git

Docker Desktop must be running before using Docker Compose.

---

## Running the Project with Docker

Docker is the recommended way to run the project.

From the root project folder:

```bash
cd event-booking-main
docker compose up --build
```

After the containers start, open:

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:5050
```

To stop the running containers:

```txt
CTRL + C
```

Then run:

```bash
docker compose down
```

To run the containers in the background:

```bash
docker compose up --build -d
```

To view logs:

```bash
docker compose logs -f
```

---

## Seeding the Database with Docker

If the database is empty or sample data is needed, run this command while Docker Compose is running:

```bash
docker compose exec backend npm run prisma:seed
```

This command runs the seed script inside the backend container.

Important note:

The seed script may reset existing sample data depending on its implementation. Use it when sample test data is needed.

---

## Docker Database Persistence

The Docker setup uses a volume for the SQLite database.

This means that data should remain available after:

```bash
docker compose down
docker compose up --build
```

However, data will be removed if volumes are deleted using:

```bash
docker compose down -v
```

Do not use `docker compose down -v` unless you intentionally want to delete the database volume.

---

## Running the Project Locally Without Docker

Docker is recommended, but the project can also be run manually.

### Backend Local Setup

Open a terminal:

```bash
cd event-booking-backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

The backend will run on:

```txt
http://localhost:5050
```

### Frontend Local Setup

Open another terminal:

```bash
cd event-booking-frontend
npm install
npm run dev
```

The frontend will run on:

```txt
http://localhost:3000
```

---

## Production Build

### Frontend Production Build

```bash
cd event-booking-frontend
npm run build
```

### Backend Production Start

```bash
cd event-booking-backend
npm start
```

---

## Sample Usage Flow

### Attendee Flow

1. Register as an attendee.
2. Login.
3. Go to the Events page.
4. Open an event detail page.
5. Click Book Ticket.
6. Go to My Bookings.
7. Verify that the booking is listed.

### Organiser Flow

1. Register as an organiser.
2. Login.
3. Go to Organiser Dashboard.
4. Create a new event.
5. Edit the event.
6. View attendee list.
7. Delete the event if needed.

---

## API Documentation

Base URL:

```txt
http://localhost:5050
```

### Authentication Routes

#### Register

```http
POST /auth/register
```

Request body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456",
  "role": "ATTENDEE"
}
```

Response (`201`):

```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "user": { "id": 1, "name": "Test User", "email": "test@example.com", "role": "ATTENDEE" }
}
```

#### Login

```http
POST /auth/login
```

Request body:

```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

Response (`200`):

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": { "id": 1, "name": "Test User", "email": "test@example.com", "role": "ATTENDEE" }
}
```

---

### Event Routes

#### Get All Events

```http
GET /events
```

Optional query parameters:

| Parameter | Type | Description |
|---|---|---|
| `search` | string | Filter by title or description |
| `capacity` | number | Minimum capacity filter |
| `sort` | `asc` \| `desc` | Sort by date (default: `asc`) |
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `5`) |

Response (`200`):

```json
{
  "success": true,
  "page": 1,
  "limit": 5,
  "total": 12,
  "totalPages": 3,
  "data": [ ]
}
```

#### Get Single Event

```http
GET /events/:id
```

Response (`200`) includes organiser info, booking count, `ticketsSold`, and `remainingCapacity`.

#### Create Event

Requires: authenticated organiser.

```http
POST /events
Authorization: Bearer <token>
```

Request body:

```json
{
  "title": "Frontend Demo Day",
  "description": "Final project frontend presentation event.",
  "dateTime": "2026-06-01T12:00:00.000Z",
  "capacity": 20
}
```

Response (`201`):

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": { }
}
```

#### Update Event

Requires: authenticated organiser who owns the event.

```http
PUT /events/:id
Authorization: Bearer <token>
```

All fields are optional. Capacity cannot be reduced below the number of existing bookings.

#### Delete Event

Requires: authenticated organiser who owns the event. Blocked if the event has any bookings.

```http
DELETE /events/:id
Authorization: Bearer <token>
```

---

### Booking Routes

#### Create Booking

Requires: authenticated attendee.

```http
POST /bookings
Authorization: Bearer <token>
```

Request body:

```json
{
  "eventId": 1
}
```

Response (`201`):

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": { }
}
```

#### Get My Bookings

Requires: authenticated attendee.

```http
GET /bookings/me
Authorization: Bearer <token>
```

Response (`200`) returns an array of bookings, each including the full event and organiser details.

---

### Organiser Dashboard Route

Requires: authenticated organiser.

```http
GET /events/dashboard/organiser
Authorization: Bearer <token>
```

Response (`200`) returns an array of the organiser's events, each including:

- `ticketsSold`
- `remainingCapacity`
- `attendees` — array of `{ bookingId, bookedAt, attendee: { id, name, email } }`

---

## Authentication Flow

1. A user registers or logs in.
2. The backend validates user input and credentials.
3. The backend returns a JWT token and user information.
4. The frontend stores the token and user information in `localStorage`.
5. Protected API requests include the token in the `Authorization` header:

```txt
Authorization: Bearer <token>
```

6. `auth.middleware.js` verifies the token using the `JWT_SECRET` environment variable. If the token is missing or invalid, a `401` response is returned.
7. `role.middleware.js` checks `req.user.role` against the roles permitted for that route. If the role does not match, a `403` response is returned.
8. For ownership-sensitive operations (update/delete event), the service layer additionally checks that `event.organiserId === req.user.id` and returns a `403` if not.

---

## Role-Based Access Control

Role-based access control is implemented on both the frontend and backend.

Frontend:

- Shows or hides UI elements depending on the user's role.
- Redirects users away from pages they should not access.
- Shows different buttons for organisers and attendees.

Backend:

- Verifies JWT tokens.
- Checks user roles.
- Checks event ownership before allowing update or delete operations.

Important:

Frontend role checks improve user experience, but real security is enforced on the backend.

---

## Notes About Ignored Files

The following files and folders are intentionally not committed:

```txt
node_modules
.next
.env
.env.local
dev.db
```

Reasons:

- `node_modules` contains installed npm packages and can be recreated with `npm install`.
- `.next` is generated by Next.js during build and can be recreated with `npm run build`.
- `.env` and `.env.local` are local environment files.
- `dev.db` is a local SQLite database file and can be recreated using Prisma migrations and seed scripts.

Example environment files are committed instead:

```txt
event-booking-backend/.env.example
event-booking-frontend/.env.example
```

---

## Academic Integrity Note

External documentation and development tools may have been used for guidance during implementation. The submitted project was reviewed and understood by the team members. Any reused or adapted code should be cited in the relevant source files according to the course policy.
