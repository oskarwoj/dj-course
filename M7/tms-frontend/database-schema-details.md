# TMS Database Schema Details

## Enum Values and Constraints

### DRIVER
- **contract_type**: `'full-time' | 'contractor'`
- **status**: `'active' | 'on-route' | 'resting' | 'off-duty' | 'sick-leave'`
- **address** (JSONB):
  ```json
  {
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string"
  }
  ```
- **emergency_contact** (JSONB):
  ```json
  {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  }
  ```
- **current_location** (JSONB):
  ```json
  {
    "lat": number,
    "lng": number,
    "address": "string",
    "updated_at": "timestamp"
  }
  ```

### DRIVER_ROUTE
- **status**: `'completed' | 'active' | 'planned' | 'cancelled'`
- **distance**: in kilometers
- **route_points** (JSONB):
  ```json
  [
    {
      "lat": number,
      "lng": number,
      "timestamp": "ISO string",
      "type": "start | stop | rest | end",
      "name": "string"
    }
  ]
  ```

### CALENDAR_EVENT
- **event_type**: `'route' | 'rest' | 'sick-leave' | 'vacation' | 'training'`
- **route_id**: nullable, FK to DRIVER_ROUTE

### VEHICLE
- **vehicle_type**: `'standard' | 'tir' | 'refrigerated' | 'hazmat' | 'container' | 'tanker' | 'flatbed' | 'box-truck' | 'heavy-haul'`
- **status**: `'available' | 'in-transit' | 'maintenance' | 'out-of-service'`
- **current_driver_id**: nullable, FK to DRIVER
- **capacity** (JSONB):
  ```json
  {
    "weight": number,  // in tons
    "volume": number   // in cubic meters
  }
  ```
- **cargo_types** (JSONB):
  ```json
  ["general", "refrigerated", "hazmat", "oversized"]
  ```
- **current_location** (JSONB):
  ```json
  {
    "lat": number,
    "lng": number,
    "address": "string",
    "updated_at": "timestamp"
  }
  ```
- **ownership** (JSONB):
  ```json
  {
    "type": "owned | leased | rented | financed",
    "purchaseDate": "date",
    "purchasePrice": number,
    "leaseStart": "date",
    "leaseEnd": "date",
    "rentalStart": "date",
    "rentalEnd": "date",
    "loanStart": "date",
    "loanEnd": "date",
    "monthlyPayment": number,
    "leasingCompany": "string",
    "rentalCompany": "string",
    "bank": "string",
    "loanAmount": number
  }
  ```

### VEHICLE_DOCUMENT
- **doc_type**: `'registration' | 'insurance' | 'inspection' | 'tir-carnet' | 'adr' | 'hazmat-permit' | 'other'`

### MAINTENANCE_RECORD
- **record_type**: `'routine' | 'repair' | 'inspection' | 'emergency'`
- **status**: `'completed' | 'in-progress' | 'pending' | 'cancelled'`

### MAINTENANCE_TASK
- **priority**: `'urgent' | 'high' | 'medium' | 'low'`
- **status**: `'pending' | 'overdue' | 'completed' | 'in-progress'`
- **task_type**: `'routine' | 'repair' | 'inspection' | 'emergency'`

### SHIPMENT
- **priority**: `'low' | 'medium' | 'high' | 'urgent'`
- **route_data** (JSONB):
  ```json
  {
    "id": "string",
    "name": "string",
    "points": [
      {
        "id": "string",
        "coordinates": {"lat": number, "lng": number},
        "type": "pickup | delivery | rest | fuel | border",
        "name": "string",
        "address": "string",
        "estimatedArrival": "ISO date",
        "estimatedDeparture": "ISO date",
        "notes": "string",
        "duration": number  // minutes
      }
    ],
    "vehicle": {
      "id": "string",
      "coordinates": {"lat": number, "lng": number},
      "heading": number,
      "speed": number,  // km/h
      "driver": "string",
      "plateNumber": "string"
    },
    "totalDistance": number,  // km
    "estimatedDuration": number,  // minutes
    "status": "planned | active | completed | delayed",
    "startTime": "ISO date",
    "estimatedCompletion": "ISO date"
  }
  ```

### ORDER
- **status**: `'Processing' | 'Shipped' | 'Delivered' | 'Canceled' | 'Returned'`
- **state_data** (JSONB) - varies by status:

  **Incoming Request:**
  ```json
  {
    "address": "string",
    "preferredDate": "string",
    "cargoType": "string",
    "mass": "string",
    "volume": "string",
    "estimatedCost": "string",
    "estimatedTime": "string",
    "distance": "string",
    "approved": boolean,
    "conflicts": boolean
  }
  ```

  **In Transit:**
  ```json
  {
    "driver": "string",
    "elapsedTime": "string",
    "distanceCovered": "string",
    "totalDistance": "string",
    "delay": boolean,
    "estimatedDelay": "string | null"
  }
  ```

  **Delivered:**
  ```json
  {
    "deliveredAt": "string",
    "recipient": "string",
    "signatureLink": "string",
    "accepted": boolean
  }
  ```

### EXPENSE
- **status**: `'Pending' | 'Approved' | 'Rejected'`
- **payment_status**: `'Paid' | 'Unpaid' | 'Partially Paid'`
- **driver_id**: nullable FK
- **vehicle_id**: nullable FK
- **shipment_id**: nullable FK (if trip-related)
- **attachments** (JSONB):
  ```json
  ["url1", "url2", "url3"]
  ```

### PAYMENT
- **status**: `'paid' | 'pending' | 'overdue' | 'partially paid' | 'cancelled'`
- **payment_method**: `'Bank Transfer' | 'Credit Card' | 'Check'`
- **payment_date**: nullable

### DOCUMENT
- **doc_type**: `'contract' | 'invoice' | 'registration' | 'insurance' | 'inspection' | 'tir-carnet' | 'adr' | 'hazmat-permit' | 'license' | 'certificate' | 'other'`
- **entity_type**: `'vehicle' | 'customer' | 'supplier' | 'driver' | 'company' | 'other'`
- **entity_id**: polymorphic FK (requires application-level validation or triggers)
- **entity_name**: denormalized for display purposes

### NOTIFICATION
- **notification_type**: `'success' | 'info' | 'message' | 'warning'`

## Unique Constraints

```sql
-- VEHICLE
ALTER TABLE vehicle ADD CONSTRAINT uq_vehicle_plate_number UNIQUE (plate_number);

-- USER
ALTER TABLE "user" ADD CONSTRAINT uq_user_email UNIQUE (email);
```

## Recommended Indexes

### Performance Indexes
```sql
-- Users
CREATE INDEX idx_user_email ON "user"(email);

-- Drivers
CREATE INDEX idx_driver_status ON driver(status);
CREATE INDEX idx_driver_license_expiry ON driver(license_expiry);
CREATE INDEX idx_driver_current_location ON driver USING GIN (current_location);

-- Vehicles
CREATE INDEX idx_vehicle_plate ON vehicle(plate_number);
CREATE INDEX idx_vehicle_status ON vehicle(status);
CREATE INDEX idx_vehicle_current_driver ON vehicle(current_driver_id);
CREATE INDEX idx_vehicle_current_location ON vehicle USING GIN (current_location);

-- Shipments
CREATE INDEX idx_shipment_priority ON shipment(priority);
CREATE INDEX idx_shipment_customer ON shipment(customer);
CREATE INDEX idx_shipment_route_data ON shipment USING GIN (route_data);

-- Orders
CREATE INDEX idx_order_customer ON "order"(customer);
CREATE INDEX idx_order_status ON "order"(status);
CREATE INDEX idx_order_date ON "order"(order_date);
CREATE INDEX idx_order_state_data ON "order" USING GIN (state_data);

-- Order Events
CREATE INDEX idx_order_event_order_id ON order_event(order_id);
CREATE INDEX idx_order_event_timestamp ON order_event(event_timestamp);

-- Tracking Events
CREATE INDEX idx_tracking_event_order_id ON tracking_event(order_id);
CREATE INDEX idx_tracking_event_timestamp ON tracking_event(event_timestamp);

-- Payments
CREATE INDEX idx_payment_order_id ON payment(order_id);
CREATE INDEX idx_payment_status ON payment(status);
CREATE INDEX idx_payment_due_date ON payment(due_date);

-- Expenses
CREATE INDEX idx_expense_driver_id ON expense(driver_id);
CREATE INDEX idx_expense_vehicle_id ON expense(vehicle_id);
CREATE INDEX idx_expense_shipment_id ON expense(shipment_id);
CREATE INDEX idx_expense_status ON expense(status);
CREATE INDEX idx_expense_date ON expense(expense_date);

-- Documents
CREATE INDEX idx_document_entity ON document(entity_type, entity_id);
CREATE INDEX idx_document_expiry ON document(expiry_date);

-- Maintenance
CREATE INDEX idx_maintenance_task_vehicle ON maintenance_task(vehicle_id);
CREATE INDEX idx_maintenance_task_status ON maintenance_task(status);
CREATE INDEX idx_maintenance_record_vehicle ON maintenance_record(vehicle_id);

-- Driver Routes
CREATE INDEX idx_driver_route_driver ON driver_route(driver_id);
CREATE INDEX idx_driver_route_status ON driver_route(status);

-- Calendar Events
CREATE INDEX idx_calendar_event_driver ON calendar_event(driver_id);
CREATE INDEX idx_calendar_event_dates ON calendar_event(start_time, end_time);

-- Notifications
CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_time ON notification(notification_time);
CREATE INDEX idx_notification_is_read ON notification(is_read);
```

### JSONB-specific Queries Examples
```sql
-- Find drivers in a specific city
SELECT * FROM driver WHERE address->>'city' = 'Warsaw';

-- Find vehicles with capacity over 10 tons
SELECT * FROM vehicle WHERE (capacity->>'weight')::numeric > 10;

-- Find shipments with 'urgent' status in route_data
SELECT * FROM shipment WHERE route_data->>'status' = 'active';

-- Find orders in 'in_transit' state with delays
SELECT * FROM "order"
WHERE status = 'Shipped'
  AND (state_data->>'delay')::boolean = true;

-- Find expenses with attachments
SELECT * FROM expense WHERE jsonb_array_length(attachments) > 0;
```

## Foreign Key Constraints

```sql
-- DRIVER
ALTER TABLE driver ADD CONSTRAINT fk_driver_user
  FOREIGN KEY (id) REFERENCES "user"(id) ON DELETE CASCADE;

-- CALENDAR_EVENT
ALTER TABLE calendar_event ADD CONSTRAINT fk_calendar_event_driver
  FOREIGN KEY (driver_id) REFERENCES driver(id) ON DELETE CASCADE;
ALTER TABLE calendar_event ADD CONSTRAINT fk_calendar_event_route
  FOREIGN KEY (route_id) REFERENCES driver_route(id) ON DELETE SET NULL;

-- DRIVER_ROUTE
ALTER TABLE driver_route ADD CONSTRAINT fk_driver_route_driver
  FOREIGN KEY (driver_id) REFERENCES driver(id) ON DELETE CASCADE;

-- VEHICLE
ALTER TABLE vehicle ADD CONSTRAINT fk_vehicle_current_driver
  FOREIGN KEY (current_driver_id) REFERENCES driver(id) ON DELETE SET NULL;

-- VEHICLE_DOCUMENT
ALTER TABLE vehicle_document ADD CONSTRAINT fk_vehicle_document_vehicle
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;

-- MAINTENANCE_TASK
ALTER TABLE maintenance_task ADD CONSTRAINT fk_maintenance_task_vehicle
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;

-- MAINTENANCE_RECORD
ALTER TABLE maintenance_record ADD CONSTRAINT fk_maintenance_record_vehicle
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;

-- ORDER_EVENT
ALTER TABLE order_event ADD CONSTRAINT fk_order_event_order
  FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE CASCADE;

-- TRACKING_EVENT
ALTER TABLE tracking_event ADD CONSTRAINT fk_tracking_event_order
  FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE CASCADE;

-- PAYMENT
ALTER TABLE payment ADD CONSTRAINT fk_payment_order
  FOREIGN KEY (order_id) REFERENCES "order"(id) ON DELETE CASCADE;

-- EXPENSE (nullable FKs)
ALTER TABLE expense ADD CONSTRAINT fk_expense_driver
  FOREIGN KEY (driver_id) REFERENCES driver(id) ON DELETE SET NULL;
ALTER TABLE expense ADD CONSTRAINT fk_expense_vehicle
  FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL;
ALTER TABLE expense ADD CONSTRAINT fk_expense_shipment
  FOREIGN KEY (shipment_id) REFERENCES shipment(id) ON DELETE SET NULL;

-- NOTIFICATION
ALTER TABLE notification ADD CONSTRAINT fk_notification_user
  FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
```

## Check Constraints

```sql
-- DRIVER
ALTER TABLE driver ADD CONSTRAINT chk_driver_contract_type
  CHECK (contract_type IN ('full-time', 'contractor'));
ALTER TABLE driver ADD CONSTRAINT chk_driver_status
  CHECK (status IN ('active', 'on-route', 'resting', 'off-duty', 'sick-leave'));

-- DRIVER_ROUTE
ALTER TABLE driver_route ADD CONSTRAINT chk_driver_route_status
  CHECK (status IN ('completed', 'active', 'planned', 'cancelled'));

-- CALENDAR_EVENT
ALTER TABLE calendar_event ADD CONSTRAINT chk_calendar_event_type
  CHECK (event_type IN ('route', 'rest', 'sick-leave', 'vacation', 'training'));

-- VEHICLE
ALTER TABLE vehicle ADD CONSTRAINT chk_vehicle_type
  CHECK (vehicle_type IN ('standard', 'tir', 'refrigerated', 'hazmat', 'container', 'tanker', 'flatbed', 'box-truck', 'heavy-haul'));
ALTER TABLE vehicle ADD CONSTRAINT chk_vehicle_status
  CHECK (status IN ('available', 'in-transit', 'maintenance', 'out-of-service'));

-- VEHICLE_DOCUMENT
ALTER TABLE vehicle_document ADD CONSTRAINT chk_vehicle_doc_type
  CHECK (doc_type IN ('registration', 'insurance', 'inspection', 'tir-carnet', 'adr', 'hazmat-permit', 'other'));

-- MAINTENANCE_RECORD
ALTER TABLE maintenance_record ADD CONSTRAINT chk_maintenance_record_type
  CHECK (record_type IN ('routine', 'repair', 'inspection', 'emergency'));
ALTER TABLE maintenance_record ADD CONSTRAINT chk_maintenance_record_status
  CHECK (status IN ('completed', 'in-progress', 'pending', 'cancelled'));

-- MAINTENANCE_TASK
ALTER TABLE maintenance_task ADD CONSTRAINT chk_maintenance_task_priority
  CHECK (priority IN ('urgent', 'high', 'medium', 'low'));
ALTER TABLE maintenance_task ADD CONSTRAINT chk_maintenance_task_status
  CHECK (status IN ('pending', 'overdue', 'completed', 'in-progress'));
ALTER TABLE maintenance_task ADD CONSTRAINT chk_maintenance_task_type
  CHECK (task_type IN ('routine', 'repair', 'inspection', 'emergency'));

-- SHIPMENT
ALTER TABLE shipment ADD CONSTRAINT chk_shipment_priority
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- ORDER
ALTER TABLE "order" ADD CONSTRAINT chk_order_status
  CHECK (status IN ('Processing', 'Shipped', 'Delivered', 'Canceled', 'Returned'));

-- EXPENSE
ALTER TABLE expense ADD CONSTRAINT chk_expense_status
  CHECK (status IN ('Pending', 'Approved', 'Rejected'));
ALTER TABLE expense ADD CONSTRAINT chk_expense_payment_status
  CHECK (payment_status IN ('Paid', 'Unpaid', 'Partially Paid'));

-- PAYMENT
ALTER TABLE payment ADD CONSTRAINT chk_payment_status
  CHECK (status IN ('paid', 'pending', 'overdue', 'partially paid', 'cancelled'));
ALTER TABLE payment ADD CONSTRAINT chk_payment_method
  CHECK (payment_method IN ('Bank Transfer', 'Credit Card', 'Check'));

-- DOCUMENT
ALTER TABLE document ADD CONSTRAINT chk_document_type
  CHECK (doc_type IN ('contract', 'invoice', 'registration', 'insurance', 'inspection', 'tir-carnet', 'adr', 'hazmat-permit', 'license', 'certificate', 'other'));
ALTER TABLE document ADD CONSTRAINT chk_document_entity_type
  CHECK (entity_type IN ('vehicle', 'customer', 'supplier', 'driver', 'company', 'other'));

-- NOTIFICATION
ALTER TABLE notification ADD CONSTRAINT chk_notification_type
  CHECK (notification_type IN ('success', 'info', 'message', 'warning'));
```
