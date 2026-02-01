-- Migration: Populate JSONB Columns with Sample Data
-- Date: 2026-02-01
-- Description: Add realistic sample data to JSONB columns for testing and demonstration

-- ============================================================================
-- VERIFY: Check current data before populating
-- ============================================================================
-- Run this first to see how many records we have:
-- SELECT COUNT(*) FROM shipments;
-- SELECT COUNT(*) FROM drivers;
-- SELECT COUNT(*) FROM vehicles;

-- ============================================================================
-- 1. UPDATE SHIPMENTS - Add metadata to existing records
-- ============================================================================

-- Update first shipment with complete metadata
UPDATE shipments
SET metadata = '{
  "pickup_instructions": "Call driver 30 minutes before arrival",
  "delivery_signature_required": true,
  "special_handling": ["fragile", "temperature-controlled"],
  "estimated_weight_kg": 50,
  "customer_contact": {
    "name": "John Smith",
    "phone": "555-0100",
    "email": "john@acmecorp.com"
  },
  "custom_fields": {
    "po_number": "PO-2025-001",
    "internal_reference": "REF-NYC-001",
    "billing_code": "PROJ-A"
  },
  "insurance": {
    "value_usd": 5000,
    "required": true
  }
}'::jsonb
WHERE id = (SELECT MIN(id) FROM shipments);

-- Update remaining shipments with varied metadata
UPDATE shipments
SET metadata = CASE
  WHEN id % 4 = 0 THEN '{
    "pickup_instructions": "Ring bell twice, leave at back entrance",
    "delivery_signature_required": false,
    "special_handling": ["fragile"],
    "estimated_weight_kg": 25,
    "custom_fields": {
      "po_number": "PO-2025-002",
      "internal_reference": "REF-BOS-001"
    }
  }'::jsonb

  WHEN id % 4 = 1 THEN '{
    "pickup_instructions": "Ask for warehouse manager",
    "delivery_signature_required": true,
    "special_handling": ["heavy-machinery"],
    "estimated_weight_kg": 500,
    "custom_fields": {
      "po_number": "PO-2025-003",
      "internal_reference": "REF-CHI-001"
    },
    "requires_equipment": ["forklift", "pallet-jack"]
  }'::jsonb

  WHEN id % 4 = 2 THEN '{
    "pickup_instructions": "No signature needed, leave in designated area",
    "delivery_signature_required": false,
    "special_handling": [],
    "estimated_weight_kg": 10,
    "custom_fields": {
      "po_number": "PO-2025-004",
      "internal_reference": "REF-LA-001"
    }
  }'::jsonb

  ELSE '{
    "pickup_instructions": "Handle with care - electronics",
    "delivery_signature_required": true,
    "special_handling": ["electronics", "anti-static-required"],
    "estimated_weight_kg": 15,
    "custom_fields": {
      "po_number": "PO-2025-005",
      "internal_reference": "REF-MIA-001"
    },
    "voltage_requirement": "110-240V"
  }'::jsonb
END
WHERE id != (SELECT MIN(id) FROM shipments)
AND status IN ('pending', 'in-transit');

-- Update delivered shipments with delivery info
UPDATE shipments
SET metadata = metadata || '{
  "delivery_info": {
    "delivered_at": "2025-02-01T14:30:00Z",
    "delivered_by": "Driver John Doe",
    "recipient_signature": true,
    "actual_weight_kg": 48
  },
  "delivery_notes": "Delivered on time, customer satisfied"
}'::jsonb
WHERE status = 'delivered';

-- ============================================================================
-- 2. UPDATE DRIVERS - Add profile_data to existing records
-- ============================================================================

-- Update first driver with complete profile
UPDATE drivers
SET profile_data = '{
  "certifications": ["cdl", "hazmat", "doubles", "tanker"],
  "certification_expiry": {
    "cdl": "2026-12-31",
    "hazmat": "2025-09-15",
    "doubles": "2027-06-30"
  },
  "emergency_contacts": [
    {
      "name": "Jane Doe",
      "phone": "555-1001",
      "relationship": "spouse"
    },
    {
      "name": "Bob Smith",
      "phone": "555-1002",
      "relationship": "parent"
    }
  ],
  "vehicle_preferences": [
    "no_manual_transmission",
    "sleeper_cab_preferred",
    "avoid_two_lane_highways"
  ],
  "documents": {
    "insurance_expiry": "2025-08-31",
    "medical_clearance_expiry": "2026-03-15",
    "background_check": "2024-06-01"
  },
  "performance": {
    "safety_rating": 9.8,
    "on_time_delivery_rate": 98.5,
    "total_miles": 250000,
    "accidents": 0,
    "violations": 0
  },
  "notes": "Top performer, excellent safety record",
  "training_completed": ["defensive_driving", "customer_service", "hazmat_safety"]
}'::jsonb
WHERE id = (SELECT MIN(id) FROM drivers);

-- Update remaining drivers with varied profiles
UPDATE drivers
SET profile_data = CASE
  WHEN id % 3 = 0 THEN '{
    "certifications": ["cdl", "hazmat"],
    "certification_expiry": {
      "cdl": "2026-06-30",
      "hazmat": "2025-12-31"
    },
    "emergency_contacts": [
      {"name": "Sarah Johnson", "phone": "555-2001", "relationship": "spouse"}
    ],
    "vehicle_preferences": ["prefer_automatic", "local_routes_only"],
    "documents": {
      "insurance_expiry": "2025-07-15",
      "medical_clearance_expiry": "2025-11-30"
    },
    "performance": {
      "safety_rating": 9.2,
      "on_time_delivery_rate": 96.0,
      "total_miles": 150000,
      "accidents": 1,
      "violations": 0
    },
    "training_completed": ["defensive_driving"]
  }'::jsonb

  WHEN id % 3 = 1 THEN '{
    "certifications": ["cdl"],
    "certification_expiry": {
      "cdl": "2026-03-15"
    },
    "emergency_contacts": [
      {"name": "Michael Brown", "phone": "555-3001", "relationship": "brother"},
      {"name": "Lisa Brown", "phone": "555-3002", "relationship": "sister"}
    ],
    "vehicle_preferences": ["newer_vehicles", "long_haul_preferred"],
    "documents": {
      "insurance_expiry": "2025-09-30",
      "medical_clearance_expiry": "2026-01-15"
    },
    "performance": {
      "safety_rating": 8.9,
      "on_time_delivery_rate": 94.5,
      "total_miles": 180000,
      "accidents": 2,
      "violations": 1
    },
    "training_completed": ["defensive_driving", "customer_service"]
  }'::jsonb

  ELSE '{
    "certifications": ["cdl", "doubles"],
    "certification_expiry": {
      "cdl": "2025-12-15",
      "doubles": "2026-09-30"
    },
    "emergency_contacts": [
      {"name": "Emily Davis", "phone": "555-4001", "relationship": "spouse"}
    ],
    "vehicle_preferences": ["no_night_shifts"],
    "documents": {
      "insurance_expiry": "2025-10-31",
      "medical_clearance_expiry": "2025-12-31"
    },
    "performance": {
      "safety_rating": 9.5,
      "on_time_delivery_rate": 97.2,
      "total_miles": 200000,
      "accidents": 0,
      "violations": 0
    },
    "training_completed": ["defensive_driving", "hazmat_safety"]
  }'::jsonb
END
WHERE id != (SELECT MIN(id) FROM drivers)
AND status = 'active';

-- ============================================================================
-- 3. UPDATE VEHICLES - Add maintenance_history to existing records
-- ============================================================================

-- Update first vehicle with comprehensive maintenance history
UPDATE vehicles
SET maintenance_history = '[
  {
    "date": "2024-12-15",
    "type": "oil_change",
    "cost": 85.50,
    "mileage": 198000,
    "notes": "Synthetic oil SAE 15W-40",
    "technician": "Mike Johnson"
  },
  {
    "date": "2024-12-20",
    "type": "tire_rotation",
    "cost": 65.00,
    "mileage": 200000,
    "notes": "All 10 tires rotated, pressure adjusted",
    "technician": "Tom Wilson"
  },
  {
    "date": "2024-12-28",
    "type": "brake_inspection",
    "cost": 150.00,
    "mileage": 205000,
    "notes": "Front pads at 6mm, rear at 8mm, rotor condition good",
    "technician": "Mike Johnson"
  },
  {
    "date": "2025-01-10",
    "type": "fuel_filter_replacement",
    "cost": 45.00,
    "mileage": 212000,
    "notes": "Preventive maintenance",
    "technician": "Tom Wilson"
  },
  {
    "date": "2025-01-25",
    "type": "engine_belt_inspection",
    "cost": 0.00,
    "mileage": 220000,
    "notes": "All belts in good condition, no replacement needed",
    "technician": "Mike Johnson"
  },
  {
    "date": "2025-02-01",
    "type": "full_inspection",
    "cost": 250.00,
    "mileage": 225000,
    "notes": "Annual inspection, vehicle passed all checks",
    "technician": "Tom Wilson"
  }
]'::jsonb
WHERE id = (SELECT MIN(id) FROM vehicles);

-- Update remaining vehicles with varied maintenance histories
UPDATE vehicles
SET maintenance_history = CASE
  WHEN id % 2 = 0 THEN '[
    {
      "date": "2024-12-01",
      "type": "oil_change",
      "cost": 85.00,
      "mileage": 95000,
      "notes": "Synthetic oil",
      "technician": "Service Team"
    },
    {
      "date": "2024-12-15",
      "type": "tire_rotation",
      "cost": 65.00,
      "mileage": 100000,
      "notes": "All tires rotated",
      "technician": "Service Team"
    },
    {
      "date": "2025-01-10",
      "type": "brake_service",
      "cost": 180.00,
      "mileage": 108000,
      "notes": "Front pads replaced",
      "technician": "Service Team"
    }
  ]'::jsonb

  ELSE '[
    {
      "date": "2024-11-20",
      "type": "oil_change",
      "cost": 80.00,
      "mileage": 50000,
      "notes": "Conventional oil",
      "technician": "Service Team"
    },
    {
      "date": "2024-12-10",
      "type": "air_filter_replacement",
      "cost": 35.00,
      "mileage": 55000,
      "notes": "Engine air filter replaced",
      "technician": "Service Team"
    },
    {
      "date": "2025-01-05",
      "type": "coolant_flush",
      "cost": 120.00,
      "mileage": 61000,
      "notes": "Preventive maintenance",
      "technician": "Service Team"
    },
    {
      "date": "2025-01-28",
      "type": "tire_repair",
      "cost": 25.00,
      "mileage": 67000,
      "notes": "Patched puncture on rear tire",
      "technician": "Service Team"
    }
  ]'::jsonb
END
WHERE id != (SELECT MIN(id) FROM vehicles)
AND status IN ('available', 'in-transit');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- View shipments with metadata
-- SELECT id, name, customer, status, metadata FROM shipments LIMIT 5;

-- View drivers with profile data
-- SELECT id, name, status, profile_data FROM drivers LIMIT 5;

-- View vehicles with maintenance history
-- SELECT id, plate_number, status, maintenance_history FROM vehicles LIMIT 5;

-- Count records with non-empty JSONB data
-- SELECT
--   (SELECT COUNT(*) FROM shipments WHERE metadata != '{}') as shipments_with_metadata,
--   (SELECT COUNT(*) FROM drivers WHERE profile_data != '{}') as drivers_with_profile,
--   (SELECT COUNT(*) FROM vehicles WHERE maintenance_history != '[]') as vehicles_with_maintenance;
