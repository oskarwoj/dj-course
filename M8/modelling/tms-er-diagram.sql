-- TMS ER Diagram SQL Script
-- PostgreSQL Database Schema

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS MANIFEST_ITEM CASCADE;
DROP TABLE IF EXISTS TRANSPORT_RESOURCE CASCADE;
DROP TABLE IF EXISTS RESOURCE_AVAILABILITY CASCADE;
DROP TABLE IF EXISTS DRIVER_DOCUMENT CASCADE;
DROP TABLE IF EXISTS RESOURCE CASCADE;
DROP TABLE IF EXISTS FLEET_VEHICLE CASCADE;
DROP TABLE IF EXISTS VEHICLE_CATEGORY CASCADE;
DROP TABLE IF EXISTS HR_DRIVER CASCADE;
DROP TABLE IF EXISTS SHIPMENT CASCADE;
DROP TABLE IF EXISTS "ORDER" CASCADE;
DROP TABLE IF EXISTS ORDER_STATUS CASCADE;
DROP TABLE IF EXISTS ADDRESS CASCADE;
DROP TABLE IF EXISTS CONTRAHENT CASCADE;
DROP TABLE IF EXISTS TRANSPORT CASCADE;

-- Create tables in dependency order

-- MODUŁ ZAMÓWIEŃ (SALES)
CREATE TABLE CONTRAHENT (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    internal_code VARCHAR(50),
    contact_details JSONB
);

CREATE INDEX idx_contrahent_tax_id ON CONTRAHENT(tax_id);
CREATE INDEX idx_contrahent_internal_code ON CONTRAHENT(internal_code);

INSERT INTO CONTRAHENT (name, tax_id, internal_code, contact_details) VALUES
('ABC Logistics Sp. z o.o.', 'PL1234567890', 'CONT001', '{"email": "contact@abclogistics.pl", "phone": "+48123456789"}'),
('XYZ Transport S.A.', 'PL0987654321', 'CONT002', '{"email": "info@xyztransport.pl", "phone": "+48987654321"}'),
('Global Shipping Ltd.', 'PL1122334455', 'CONT003', '{"email": "sales@globalshipping.pl", "phone": "+48112233445"}'),
('Fast Delivery Sp. z o.o.', 'PL5566778899', 'CONT004', '{"email": "office@fastdelivery.pl", "phone": "+48556677889"}'),
('Premium Cargo S.A.', 'PL9988776655', 'CONT005', '{"email": "contact@premiumcargo.pl", "phone": "+48998877665"}');

CREATE TABLE ADDRESS (
    id SERIAL PRIMARY KEY,
    contrahent_id INTEGER NOT NULL REFERENCES CONTRAHENT(id) ON DELETE CASCADE,
    label VARCHAR(100),
    full_address_data JSONB NOT NULL
);

CREATE INDEX idx_address_contrahent_id ON ADDRESS(contrahent_id);

INSERT INTO ADDRESS (contrahent_id, label, full_address_data) VALUES
(1, 'Siedziba główna', '{"city": "Warszawa", "street": "ul. Przykładowa 1", "post_code": "00-001", "country": "Poland", "contact_person": "Jan Kowalski", "phone": "+48123456789"}'),
(1, 'Magazyn', '{"city": "Kraków", "street": "ul. Magazynowa 10", "post_code": "30-001", "country": "Poland", "contact_person": "Anna Nowak", "phone": "+48111111111"}'),
(2, 'Biuro', '{"city": "Gdańsk", "street": "ul. Portowa 5", "post_code": "80-001", "country": "Poland", "contact_person": "Piotr Wiśniewski", "phone": "+48222222222"}'),
(3, 'Centrum dystrybucyjne', '{"city": "Wrocław", "street": "ul. Logistyczna 20", "post_code": "50-001", "country": "Poland", "contact_person": "Maria Zielińska", "phone": "+48333333333"}'),
(4, 'Oddział', '{"city": "Poznań", "street": "ul. Transportowa 15", "post_code": "60-001", "country": "Poland", "contact_person": "Tomasz Lewandowski", "phone": "+48444444444"}');

CREATE TABLE ORDER_STATUS (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL
);

CREATE INDEX idx_order_status_code ON ORDER_STATUS(code);

INSERT INTO ORDER_STATUS (code, display_name) VALUES
('DRAFT', 'Szkic'),
('CONFIRMED', 'Potwierdzone'),
('IN_PROGRESS', 'W realizacji'),
('COMPLETED', 'Zrealizowane'),
('CANCELLED', 'Anulowane');

CREATE TABLE "ORDER" (
    id SERIAL PRIMARY KEY,
    contrahent_id INTEGER NOT NULL REFERENCES CONTRAHENT(id) ON DELETE RESTRICT,
    status_id INTEGER NOT NULL REFERENCES ORDER_STATUS(id) ON DELETE RESTRICT,
    customer_ref VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deadline TIMESTAMP,
    total_agreed_price DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'PLN',
    internal_notes TEXT
);

CREATE INDEX idx_order_contrahent_id ON "ORDER"(contrahent_id);
CREATE INDEX idx_order_status_id ON "ORDER"(status_id);
CREATE INDEX idx_order_customer_ref ON "ORDER"(customer_ref);
CREATE INDEX idx_order_created_at ON "ORDER"(created_at);
CREATE INDEX idx_order_deadline ON "ORDER"(deadline);

INSERT INTO "ORDER" (contrahent_id, status_id, customer_ref, created_at, deadline, total_agreed_price, currency, internal_notes) VALUES
(1, 2, 'ORD-2024-001', '2024-01-15 10:00:00', '2024-01-20 18:00:00', 15000.00, 'PLN', 'Pilne zamówienie'),
(1, 3, 'ORD-2024-002', '2024-01-16 09:00:00', '2024-01-25 17:00:00', 25000.50, 'PLN', NULL),
(2, 2, 'ORD-2024-003', '2024-01-17 11:00:00', '2024-01-22 16:00:00', 18000.00, 'PLN', 'Wymaga specjalnego transportu'),
(3, 4, 'ORD-2024-004', '2024-01-10 08:00:00', '2024-01-18 15:00:00', 32000.75, 'PLN', 'Zrealizowane wcześniej'),
(4, 1, 'ORD-2024-005', '2024-01-18 14:00:00', '2024-01-28 18:00:00', 12000.00, 'PLN', NULL);

CREATE TABLE SHIPMENT (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES "ORDER"(id) ON DELETE CASCADE,
    pickup_address_snapshot JSONB NOT NULL,
    delivery_address_snapshot JSONB NOT NULL,
    weight DECIMAL(10, 2),
    pallets_count INTEGER,
    goods_description TEXT,
    requirements JSONB
);

CREATE INDEX idx_shipment_order_id ON SHIPMENT(order_id);

INSERT INTO SHIPMENT (order_id, pickup_address_snapshot, delivery_address_snapshot, weight, pallets_count, goods_description, requirements) VALUES
(1, '{"city": "Warszawa", "street": "ul. Przykładowa 1", "post_code": "00-001"}', '{"city": "Kraków", "street": "ul. Magazynowa 10", "post_code": "30-001"}', 2500.50, 12, 'Elektronika', NULL),
(1, '{"city": "Warszawa", "street": "ul. Przykładowa 1", "post_code": "00-001"}', '{"city": "Gdańsk", "street": "ul. Portowa 5", "post_code": "80-001"}', 1800.00, 8, 'Meble', NULL),
(2, '{"city": "Gdańsk", "street": "ul. Portowa 5", "post_code": "80-001"}', '{"city": "Wrocław", "street": "ul. Logistyczna 20", "post_code": "50-001"}', 3200.75, 15, 'Chemikalia', '{"temperature": "2-8°C", "ADR": true}'),
(3, '{"city": "Wrocław", "street": "ul. Logistyczna 20", "post_code": "50-001"}', '{"city": "Poznań", "street": "ul. Transportowa 15", "post_code": "60-001"}', 1500.00, 6, 'Odzież', NULL),
(4, '{"city": "Poznań", "street": "ul. Transportowa 15", "post_code": "60-001"}', '{"city": "Warszawa", "street": "ul. Przykładowa 1", "post_code": "00-001"}', 2800.25, 14, 'Żywność', '{"temperature": "-18°C"}');

-- MODUŁ KADROWY (HR)
CREATE TABLE HR_DRIVER (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE,
    contact_info JSONB
);

CREATE INDEX idx_hr_driver_employee_id ON HR_DRIVER(employee_id);
CREATE INDEX idx_hr_driver_name ON HR_DRIVER(last_name, first_name);

INSERT INTO HR_DRIVER (first_name, last_name, employee_id, contact_info) VALUES
('Jan', 'Kowalski', 'EMP001', '{"phone": "+48111111111", "email": "jan.kowalski@company.pl"}'),
('Anna', 'Nowak', 'EMP002', '{"phone": "+48222222222", "email": "anna.nowak@company.pl"}'),
('Piotr', 'Wiśniewski', 'EMP003', '{"phone": "+48333333333", "email": "piotr.wisniewski@company.pl"}'),
('Maria', 'Zielińska', 'EMP004', '{"phone": "+48444444444", "email": "maria.zielinska@company.pl"}'),
('Tomasz', 'Lewandowski', 'EMP005', '{"phone": "+48555555555", "email": "tomasz.lewandowski@company.pl"}');

CREATE TABLE DRIVER_DOCUMENT (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES HR_DRIVER(id) ON DELETE CASCADE,
    doc_type VARCHAR(50) NOT NULL,
    doc_number VARCHAR(100) NOT NULL,
    expiry_date DATE,
    metadata JSONB
);

CREATE INDEX idx_driver_document_driver_id ON DRIVER_DOCUMENT(driver_id);
CREATE INDEX idx_driver_document_type ON DRIVER_DOCUMENT(doc_type);
CREATE INDEX idx_driver_document_expiry_date ON DRIVER_DOCUMENT(expiry_date);

INSERT INTO DRIVER_DOCUMENT (driver_id, doc_type, doc_number, expiry_date, metadata) VALUES
(1, 'PRAWO_JAZDY', 'ABC123456', '2028-12-31', '{"categories": ["B", "C", "CE"]}'),
(1, 'KWALIFIKACJA', 'KW001234', '2026-06-30', NULL),
(2, 'PRAWO_JAZDY', 'DEF789012', '2029-03-15', '{"categories": ["B", "C"]}'),
(2, 'KWALIFIKACJA', 'KW005678', '2027-09-20', NULL),
(3, 'PRAWO_JAZDY', 'GHI345678', '2028-08-10', '{"categories": ["B", "C", "CE", "D"]}'),
(4, 'PRAWO_JAZDY', 'JKL901234', '2027-11-25', '{"categories": ["B", "C"]}'),
(5, 'PRAWO_JAZDY', 'MNO567890', '2029-05-05', '{"categories": ["B", "C", "CE"]}');

-- MODUŁ FLOTY (FLEET)
CREATE TABLE VEHICLE_CATEGORY (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE
);

CREATE INDEX idx_vehicle_category_code ON VEHICLE_CATEGORY(code);

INSERT INTO VEHICLE_CATEGORY (name, code) VALUES
('Samochód dostawczy', 'VAN'),
('Ciężarówka', 'TRUCK'),
('Ciągnik siodłowy', 'TRACTOR'),
('Naczepa', 'TRAILER'),
('Chłodnia', 'REFRIGERATED');

CREATE TABLE FLEET_VEHICLE (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES VEHICLE_CATEGORY(id) ON DELETE RESTRICT,
    plates VARCHAR(20) NOT NULL UNIQUE,
    vin VARCHAR(50) UNIQUE,
    technical_specs JSONB
);

CREATE INDEX idx_fleet_vehicle_category_id ON FLEET_VEHICLE(category_id);
CREATE INDEX idx_fleet_vehicle_plates ON FLEET_VEHICLE(plates);
CREATE INDEX idx_fleet_vehicle_vin ON FLEET_VEHICLE(vin);

INSERT INTO FLEET_VEHICLE (category_id, plates, vin, technical_specs) VALUES
(2, 'WA12345', '1HGBH41JXMN109186', '{"capacity": "7.5t", "fuel": "diesel", "year": 2020}'),
(3, 'KR67890', '2HGBH41JXMN109187', '{"capacity": "20t", "fuel": "diesel", "year": 2021}'),
(2, 'GD11111', '3HGBH41JXMN109188', '{"capacity": "10t", "fuel": "diesel", "year": 2019}'),
(5, 'WR22222', '4HGBH41JXMN109189', '{"capacity": "15t", "fuel": "diesel", "year": 2022, "temperature_range": "-25°C do +25°C"}'),
(4, 'PO33333', NULL, '{"capacity": "24t", "type": "standard"}');

-- MODUŁ ZASOBÓW I DOSTĘPNOŚCI
CREATE TABLE RESOURCE (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    external_id INTEGER
);

CREATE INDEX idx_resource_type ON RESOURCE(resource_type);
CREATE INDEX idx_resource_external_id ON RESOURCE(external_id);

INSERT INTO RESOURCE (resource_type, metadata, external_id) VALUES
('DRIVER', '{"name": "Jan Kowalski", "employee_id": "EMP001"}', 1),
('DRIVER', '{"name": "Anna Nowak", "employee_id": "EMP002"}', 2),
('DRIVER', '{"name": "Piotr Wiśniewski", "employee_id": "EMP003"}', 3),
('VEHICLE', '{"plates": "WA12345", "category": "TRUCK"}', 1),
('VEHICLE', '{"plates": "KR67890", "category": "TRACTOR"}', 2),
('VEHICLE', '{"plates": "GD11111", "category": "TRUCK"}', 3),
('VEHICLE', '{"plates": "WR22222", "category": "REFRIGERATED"}', 4),
('VEHICLE', '{"plates": "PO33333", "category": "TRAILER"}', 5);

CREATE TABLE RESOURCE_AVAILABILITY (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER NOT NULL REFERENCES RESOURCE(id) ON DELETE CASCADE,
    busy_range TSRANGE NOT NULL,
    reason VARCHAR(50) NOT NULL,
    reference_transport_id INTEGER
);

CREATE INDEX idx_resource_availability_resource_id ON RESOURCE_AVAILABILITY(resource_id);
CREATE INDEX idx_resource_availability_busy_range ON RESOURCE_AVAILABILITY USING GIST(busy_range);
CREATE INDEX idx_resource_availability_reference_transport_id ON RESOURCE_AVAILABILITY(reference_transport_id);

INSERT INTO RESOURCE_AVAILABILITY (resource_id, busy_range, reason, reference_transport_id) VALUES
(1, '[2024-01-20 08:00:00, 2024-01-20 18:00:00)', 'TRANSPORT', 1),
(4, '[2024-01-20 08:00:00, 2024-01-20 18:00:00)', 'TRANSPORT', 1),
(2, '[2024-01-22 06:00:00, 2024-01-22 20:00:00)', 'TRANSPORT', 2),
(5, '[2024-01-22 06:00:00, 2024-01-22 20:00:00)', 'TRANSPORT', 2),
(3, '[2024-01-25 00:00:00, 2024-01-27 23:59:59)', 'HOLIDAY', NULL),
(6, '[2024-01-18 00:00:00, 2024-01-19 23:59:59)', 'MAINTENANCE', NULL);

-- MODUŁ TRANSPORTU (OPERATIONS)
CREATE TABLE TRANSPORT (
    id SERIAL PRIMARY KEY,
    transport_status_id INTEGER NOT NULL,
    scheduled_range TSRANGE,
    route_notes TEXT,
    estimated_km DECIMAL(10, 2)
);

CREATE INDEX idx_transport_status_id ON TRANSPORT(transport_status_id);
CREATE INDEX idx_transport_scheduled_range ON TRANSPORT USING GIST(scheduled_range);

INSERT INTO TRANSPORT (transport_status_id, scheduled_range, route_notes, estimated_km) VALUES
(2, '[2024-01-20 08:00:00, 2024-01-20 18:00:00)', 'Trasa Warszawa-Kraków, autostrada A4', 290.5),
(2, '[2024-01-22 06:00:00, 2024-01-22 20:00:00)', 'Trasa Gdańsk-Wrocław, droga krajowa', 450.0),
(3, '[2024-01-17 10:00:00, 2024-01-17 16:00:00)', 'Trasa lokalna Wrocław-Poznań', 180.0),
(1, '[2024-01-25 09:00:00, 2024-01-25 17:00:00)', 'Trasa do potwierdzenia', 320.0),
(4, '[2024-01-15 08:00:00, 2024-01-15 14:00:00)', 'Trasa zrealizowana', 150.0);

CREATE TABLE TRANSPORT_RESOURCE (
    id SERIAL PRIMARY KEY,
    transport_id INTEGER NOT NULL REFERENCES TRANSPORT(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES RESOURCE(id) ON DELETE RESTRICT,
    role VARCHAR(50) NOT NULL
);

CREATE INDEX idx_transport_resource_transport_id ON TRANSPORT_RESOURCE(transport_id);
CREATE INDEX idx_transport_resource_resource_id ON TRANSPORT_RESOURCE(resource_id);
CREATE INDEX idx_transport_resource_role ON TRANSPORT_RESOURCE(role);

INSERT INTO TRANSPORT_RESOURCE (transport_id, resource_id, role) VALUES
(1, 1, 'PRIMARY_DRIVER'),
(1, 4, 'VEHICLE'),
(2, 2, 'PRIMARY_DRIVER'),
(2, 5, 'VEHICLE'),
(2, 5, 'TRAILER'),
(3, 3, 'PRIMARY_DRIVER'),
(3, 6, 'VEHICLE'),
(4, 1, 'PRIMARY_DRIVER'),
(4, 4, 'VEHICLE');

CREATE TABLE MANIFEST_ITEM (
    id SERIAL PRIMARY KEY,
    shipment_id INTEGER NOT NULL REFERENCES SHIPMENT(id) ON DELETE CASCADE,
    transport_id INTEGER NOT NULL REFERENCES TRANSPORT(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    actual_time TIMESTAMP
);

CREATE INDEX idx_manifest_item_shipment_id ON MANIFEST_ITEM(shipment_id);
CREATE INDEX idx_manifest_item_transport_id ON MANIFEST_ITEM(transport_id);
CREATE INDEX idx_manifest_item_sequence_order ON MANIFEST_ITEM(transport_id, sequence_order);

INSERT INTO MANIFEST_ITEM (shipment_id, transport_id, sequence_order, action_type, actual_time) VALUES
(1, 1, 1, 'LOAD', '2024-01-20 08:30:00'),
(1, 1, 2, 'UNLOAD', '2024-01-20 16:45:00'),
(2, 1, 3, 'LOAD', '2024-01-20 09:00:00'),
(2, 1, 4, 'UNLOAD', '2024-01-20 17:00:00'),
(3, 2, 1, 'LOAD', '2024-01-22 06:30:00'),
(3, 2, 2, 'UNLOAD', '2024-01-22 19:15:00'),
(4, 3, 1, 'LOAD', '2024-01-17 10:00:00'),
(4, 3, 2, 'UNLOAD', '2024-01-17 15:30:00'),
(5, 4, 1, 'LOAD', NULL),
(5, 4, 2, 'UNLOAD', NULL);
