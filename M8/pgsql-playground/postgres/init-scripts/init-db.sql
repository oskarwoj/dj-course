-- Drivers table
CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    hired_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    capacity_kg DECIMAL(10, 2),
    fuel_type VARCHAR(20) CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid')),
    last_maintenance_date DATE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shipments table with enhanced schema
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    weight_kg DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'standard' CHECK (priority IN ('standard', 'express', 'urgent')),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Routes table
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    distance_km DECIMAL(10, 2),
    estimated_duration_hours DECIMAL(5, 2),
    waypoints JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table (links drivers, vehicles, shipments, and routes)
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
    scheduled_date DATE NOT NULL,
    actual_departure TIMESTAMP,
    actual_arrival TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample drivers
INSERT INTO drivers (name, license_number, phone, email, hired_date, status) VALUES
('Jan Kowalski', 'DL-PL-123456', '+48123456789', 'jan.kowalski@example.com', '2023-01-15', 'active'),
('Anna Nowak', 'DL-PL-234567', '+48234567890', 'anna.nowak@example.com', '2023-03-20', 'active'),
('Piotr Wiśniewski', 'DL-PL-345678', '+48345678901', 'piotr.wisniewski@example.com', '2023-06-10', 'on_leave'),
('Maria Schmidt', 'DL-DE-456789', '+49123456789', 'maria.schmidt@example.com', '2023-02-01', 'active');

-- Insert sample vehicles
INSERT INTO vehicles (plate_number, model, year, capacity_kg, fuel_type, last_maintenance_date, status) VALUES
('WA-12345', 'Mercedes Sprinter', 2022, 3500.00, 'diesel', '2024-12-15', 'available'),
('KR-67890', 'Volkswagen Crafter', 2021, 3000.00, 'diesel', '2024-11-20', 'in_use'),
('WA-11111', 'Renault Master', 2023, 3200.00, 'electric', '2025-01-10', 'available'),
('BE-22222', 'Ford Transit', 2020, 2800.00, 'petrol', '2024-10-05', 'maintenance');

-- Insert sample shipments
INSERT INTO shipments (tracking_number, origin, destination, weight_kg, status, priority, metadata) VALUES
('PL12345', 'Warszawa', 'Berlin', 15.5, 'in_transit', 'express',
    '{"tags": ["fragile", "express"], "customer": "ABC Corp", "value_eur": 500}'),
('DE67890', 'Hamburg', 'Kraków', 2.0, 'delivered', 'standard',
    '{"tags": ["standard"], "customer": "XYZ Ltd", "value_eur": 100}'),
('PL11111', 'Gdańsk', 'Wien', 25.0, 'pending', 'urgent',
    '{"tags": ["urgent", "perishable"], "customer": "Fresh Foods Inc", "value_eur": 1200}'),
('DE22222', 'Berlin', 'Warszawa', 10.5, 'pending', 'standard',
    '{"tags": ["standard"], "customer": "Tech Solutions", "value_eur": 800}');

-- Insert sample routes
INSERT INTO routes (name, start_location, end_location, distance_km, estimated_duration_hours, waypoints) VALUES
('Warsaw-Berlin Express', 'Warszawa', 'Berlin', 573.0, 6.5,
    '["Poznań", "Frankfurt/Oder"]'),
('Hamburg-Krakow', 'Hamburg', 'Kraków', 1050.0, 11.0,
    '["Berlin", "Wrocław"]'),
('Gdansk-Vienna', 'Gdańsk', 'Wien', 890.0, 10.5,
    '["Warszawa", "Katowice", "Ostrava"]'),
('Berlin-Warsaw Standard', 'Berlin', 'Warszawa', 573.0, 7.0,
    '["Frankfurt/Oder", "Poznań"]');

-- Insert sample deliveries
INSERT INTO deliveries (shipment_id, driver_id, vehicle_id, route_id, scheduled_date, actual_departure, actual_arrival, status, notes) VALUES
(1, 1, 2, 1, '2024-01-20', '2024-01-20 08:00:00', NULL, 'in_progress', 'Express delivery - handle with care'),
(2, 2, 2, 2, '2024-01-18', '2024-01-18 09:00:00', '2024-01-18 20:00:00', 'completed', 'Delivered successfully'),
(3, 4, 1, 3, '2024-01-22', NULL, NULL, 'scheduled', 'Perishable goods - temperature controlled'),
(4, 1, 1, 4, '2024-01-23', NULL, NULL, 'scheduled', 'Standard delivery');

-- Create indexes for better query performance
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_scheduled_date ON deliveries(scheduled_date);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_vehicles_status ON vehicles(status);

-- Create a view for active deliveries with full details
CREATE VIEW active_deliveries_view AS
SELECT
    d.id as delivery_id,
    s.tracking_number,
    s.origin,
    s.destination,
    s.priority,
    dr.name as driver_name,
    v.plate_number,
    v.model as vehicle_model,
    r.name as route_name,
    d.scheduled_date,
    d.status as delivery_status,
    d.notes
FROM deliveries d
JOIN shipments s ON d.shipment_id = s.id
LEFT JOIN drivers dr ON d.driver_id = dr.id
LEFT JOIN vehicles v ON d.vehicle_id = v.id
LEFT JOIN routes r ON d.route_id = r.id
WHERE d.status IN ('scheduled', 'in_progress');