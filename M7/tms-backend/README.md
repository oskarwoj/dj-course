# TMS Backend

Simple Node.js + Express + PostgreSQL backend for the Transportation Management System (TMS) learning project.

## Features

- **Database**: PostgreSQL 18 with 3 tables (drivers, vehicles, shipments)
- **API**: REST endpoints with full CRUD operations
- **No Authentication**: Simplified for learning SQL basics
- **Raw SQL**: Using `pg` library (no ORM) for direct database interaction

## Tech Stack

- Node.js
- Express 5
- PostgreSQL 18
- pg (node-postgres)
- CORS enabled for frontend integration

## Prerequisites

- PostgreSQL 18 installed and running
- Node.js (v18+)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
The `.env` file is already configured with:
```env
PORT=3030
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tms_db
DB_USER=oskarwojciechowski
DB_PASSWORD=
CORS_ORIGIN=http://localhost:4002
```

3. Initialize the database:
```bash
npm run db:init
```

This creates the database tables and seeds sample data.

## Usage

Start the development server:
```bash
npm run dev
```

The API will be available at: `http://localhost:3030/api`

## API Endpoints

### Drivers
- `GET /api/drivers` - List all drivers
- `GET /api/drivers/:id` - Get single driver
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get single vehicle
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Shipments
- `GET /api/shipments` - List all shipments
- `GET /api/shipments/:id` - Get single shipment
- `POST /api/shipments` - Create shipment
- `PUT /api/shipments/:id` - Update shipment
- `DELETE /api/shipments/:id` - Delete shipment

## Example API Calls

### List all drivers
```bash
curl http://localhost:3030/api/drivers
```

### Create a new driver
```bash
curl -X POST http://localhost:3030/api/drivers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Driver",
    "email": "test@example.com",
    "phone": "555-1234",
    "status": "active",
    "license_number": "DL123",
    "hire_date": "2024-01-01"
  }'
```

### Update a driver
```bash
curl -X PUT http://localhost:3030/api/drivers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "555-5678",
    "status": "on-route",
    "license_number": "DL123",
    "hire_date": "2024-01-01"
  }'
```

### Delete a driver
```bash
curl -X DELETE http://localhost:3030/api/drivers/1
```

## Database Schema

### Drivers Table
- `id` - Serial (auto-increment)
- `name` - VARCHAR(255)
- `email` - VARCHAR(255) UNIQUE
- `phone` - VARCHAR(50)
- `status` - VARCHAR(50) ('active', 'on-route', 'off-duty')
- `license_number` - VARCHAR(100)
- `hire_date` - DATE
- `created_at` - TIMESTAMP

### Vehicles Table
- `id` - Serial
- `plate_number` - VARCHAR(50) UNIQUE
- `make` - VARCHAR(100)
- `model` - VARCHAR(100)
- `year` - INTEGER
- `type` - VARCHAR(50)
- `status` - VARCHAR(50) ('available', 'in-transit', 'maintenance')
- `mileage` - INTEGER
- `created_at` - TIMESTAMP

### Shipments Table
- `id` - Serial
- `name` - VARCHAR(255)
- `customer` - VARCHAR(255)
- `origin` - VARCHAR(255)
- `destination` - VARCHAR(255)
- `status` - VARCHAR(50) ('pending', 'in-transit', 'delivered')
- `driver_id` - INTEGER (foreign key to drivers)
- `vehicle_id` - INTEGER (foreign key to vehicles)
- `created_at` - TIMESTAMP

## Project Structure

```
tms-backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection pool
│   ├── controllers/
│   │   ├── drivers.controller.js    # Driver CRUD operations
│   │   ├── vehicles.controller.js   # Vehicle CRUD operations
│   │   └── shipments.controller.js  # Shipment CRUD operations
│   ├── routes/
│   │   ├── drivers.routes.js    # Driver routes
│   │   ├── vehicles.routes.js   # Vehicle routes
│   │   └── shipments.routes.js  # Shipment routes
│   ├── middleware/
│   │   └── errorHandler.js      # Global error handler
│   ├── db/
│   │   ├── schema.sql           # Database schema
│   │   ├── seed.sql             # Sample data
│   │   └── init.js              # Database initialization script
│   └── app.js                   # Express app setup
├── server.js                    # Entry point
├── .env                         # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:init` - Initialize database (drop & recreate tables, seed data)

## Security Features

- Parameterized queries to prevent SQL injection
- CORS configured for specific origin
- Error handling for database constraints
- No sensitive data in version control (.env in .gitignore)

## Learning Focus

This backend is designed for learning:
- Raw SQL queries with parameterized statements
- PostgreSQL database design with foreign keys
- Express.js routing and middleware
- RESTful API design patterns
- Error handling in async operations

## Next Steps

Once comfortable with the basics, consider adding:
- Authentication (JWT)
- Input validation
- More complex queries (joins, aggregations)
- Transaction handling
- Pagination for large datasets
- API documentation (Swagger/OpenAPI)
