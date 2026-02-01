-- Sample Drivers
INSERT INTO drivers (name, email, phone, status, license_number, hire_date) VALUES
('John Doe', 'john@example.com', '555-0101', 'active', 'DL123456', '2023-01-15'),
('Jane Smith', 'jane@example.com', '555-0102', 'on-route', 'DL789012', '2023-03-20'),
('Bob Wilson', 'bob@example.com', '555-0103', 'off-duty', 'DL345678', '2022-11-10');

-- Sample Vehicles
INSERT INTO vehicles (plate_number, make, model, year, type, status, mileage) VALUES
('ABC-123', 'Volvo', 'FH16', 2022, 'truck', 'available', 45000),
('XYZ-789', 'Mercedes', 'Actros', 2021, 'truck', 'in-transit', 78000),
('DEF-456', 'Scania', 'R450', 2023, 'truck', 'maintenance', 12000);

-- Sample Shipments
INSERT INTO shipments (name, customer, origin, destination, status, driver_id, vehicle_id) VALUES
('Shipment #001', 'ACME Corp', 'Warsaw', 'Berlin', 'in-transit', 2, 2),
('Shipment #002', 'Global Inc', 'Prague', 'Vienna', 'delivered', 1, 1),
('Shipment #003', 'Tech Ltd', 'Budapest', 'Munich', 'pending', NULL, NULL);
