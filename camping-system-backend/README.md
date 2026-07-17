#  Event Booking & Ticketing System (Backend)

##  Team Members
- Sıla Öztürk — 2587483  
- Ahmet Altınbaş — 2586345



##  Project Description
This project is a backend system for an Event Booking & Ticketing System.  
Organisers can create, update, and delete events, while attendees can browse events and book tickets.  
The system prevents overbooking and enforces role-based access control.



## Tech Stack
- Node.js
- Express.js
- Prisma ORM
- SQLite / PostgreSQL
- JWT Authentication
- bcrypt
- Zod (validation)



##  Setup Instructions

### 1. Clone the repository
```bash
git clone <repo-link>
cd <project-folder>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
Create a `.env` file in the root directory and add:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
```

### 4. Run database migrations
```bash
npx prisma migrate dev
```

### 5. Seed the database
```bash
npm run seed
```

### 6. Start the server
```bash
npm run dev
```



## Environment Variables
- `DATABASE_URL`: Database connection string  
- `JWT_SECRET`: Secret key for JWT token generation  



##  Database Models

### User
- id
- name
- email
- password
- role (organiser / attendee)

### Event
- id
- title
- description
- dateTime
- capacity
- organiserId

### Booking
- id
- userId
- eventId
- bookedAt



##  Architecture
The project follows a layered architecture:

- **Routes** → Define API endpoints  
- **Controllers** → Handle request and response  
- **Services** → Contain business logic  
- **Middleware** → Authentication, authorization, validation, error handling  
- **Prisma Client** → Database communication  

This structure ensures clean separation of concerns, scalability, and maintainability.



##  Authentication
The system uses JWT-based authentication.

- Users register and log in  
- A JWT token is generated upon register and login  
- Protected routes require a valid token  
- Role-based middleware restricts access:
  - Organisers : manage events  
  - Attendees : book tickets  



##  API Documentation

###  Auth
- `POST /api/auth/register` → Register a new user  
- `POST /api/auth/login` → Login and receive JWT token  



###  Events
- `GET /api/events` → Get all events  
- `GET /api/events/id` → Get event by ID  
- `POST /api/events` → Create event (Organiser only)  
- `PUT /api/events/id` → Update event (Organiser only)  
- `DELETE /api/events/id` → Delete event (Organiser only)  



###  Bookings
- `POST /api/bookings` → Book a ticket (Attendee only)  
- `GET /api/bookings/me` → Get user's bookings  
- `DELETE /api/bookings/id` → Cancel booking  



###  Organiser Dashboard
- `GET /api/events/id` → View attendee list  
- `GET /api/events` → View tickets sold and remaining capacity  



##  Validation & Business Rules
- Email must be unique  
- Password is hashed before storing  
- Only organisers can manage events  
- Only attendees can book tickets  
- Overbooking is prevented  
- A user cannot book the same event twice  



##  Error Handling
The API returns appropriate HTTP status codes:

- `200 OK`  
- `201 Created`  
- `400 Bad Request`  
- `401 Unauthorized`  
- `403 Forbidden`  
- `404 Not Found`  
- `500 Internal Server Error`  



##  Seed Data
The seed script populates the database with sample users, events, and bookings.

Run:
```bash
npm run seed
```



##  Bonus Features
- Pagination 
- Filtering / search 
- Sorting  



## AI Usage

AI tool ChatGPT were used as assistance during development for:
- understanding concepts
- debugging errors
- improving code structure

All generated code was reviewed, modified, and adapted by the team.  
We fully understand the implementation and can explain all parts of the system.