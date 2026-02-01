-- Drop tables if they exist (for clean re-initialization)
DROP TABLE IF EXISTS shipments CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;

-- Drivers Table
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('active', 'on-route', 'off-duty')),
    license_number VARCHAR(100),
    hire_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_drivers_status ON drivers(status);

-- Vehicles Table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER,
    type VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('available', 'in-transit', 'maintenance')),
    mileage INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Shipments Table
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer VARCHAR(255) NOT NULL,
    origin VARCHAR(255),
    destination VARCHAR(255),
    status VARCHAR(50) CHECK (status IN ('pending', 'in-transit', 'delivered')),
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shipments_driver ON shipments(driver_id);
CREATE INDEX idx_shipments_vehicle ON shipments(vehicle_id);
CREATE INDEX idx_shipments_status ON shipments(status);
