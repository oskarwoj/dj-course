-- Query 1: Pojazdy wraz ze szczegółami z katalogów pojazdów
SELECT 
    fv.id AS vehicle_id,
    fv.plates,
    fv.vin,
    vc.name AS category_name,
    vc.code AS category_code,
    fv.technical_specs
FROM FLEET_VEHICLE fv
JOIN VEHICLE_CATEGORY vc ON fv.category_id = vc.id
ORDER BY fv.id;

-- Query 2: Kierowcy wraz ze szczegółami, w szczególności lista dokumentów dla każdego kierowcy (jako array)
SELECT 
    d.id AS driver_id,
    d.first_name,
    d.last_name,
    d.employee_id,
    d.contact_info,
    COALESCE(
        json_agg(
            json_build_object(
                'id', dd.id,
                'doc_type', dd.doc_type,
                'doc_number', dd.doc_number,
                'expiry_date', dd.expiry_date,
                'metadata', dd.metadata
            )
        ) FILTER (WHERE dd.id IS NOT NULL),
        '[]'::json
    ) AS documents
FROM HR_DRIVER d
LEFT JOIN DRIVER_DOCUMENT dd ON d.id = dd.driver_id
GROUP BY d.id, d.first_name, d.last_name, d.employee_id, d.contact_info
ORDER BY d.id;

-- Query 3: Dla określonego pojazdu - wszystkie rezerwacje (availability)
-- Wybieram pojazd z tablicami WA12345 (resource_id = 4), który ma rezerwacje
SELECT 
    fv.id AS vehicle_id,
    fv.plates,
    fv.vin,
    vc.name AS category_name,
    ra.id AS availability_id,
    ra.busy_range,
    ra.reason,
    ra.reference_transport_id,
    t.scheduled_range AS transport_scheduled_range,
    t.route_notes,
    t.estimated_km
FROM FLEET_VEHICLE fv
JOIN VEHICLE_CATEGORY vc ON fv.category_id = vc.id
JOIN RESOURCE r ON r.resource_type = 'VEHICLE' AND r.external_id = fv.id
JOIN RESOURCE_AVAILABILITY ra ON ra.resource_id = r.id
LEFT JOIN TRANSPORT t ON ra.reference_transport_id = t.id
WHERE fv.plates = 'WA12345'
ORDER BY ra.busy_range;

-- Alternatywnie dla pojazdu KR67890 (który również ma rezerwacje):
-- WHERE fv.plates = 'KR67890'

-- Query 4: Szczegóły zamówienia z powiązanymi informacjami o kontrahencie, wysyłce, statusie zamówienia
SELECT 
    o.id AS order_id,
    o.customer_ref,
    o.created_at,
    o.deadline,
    o.total_agreed_price,
    o.currency,
    o.internal_notes,
    -- Informacje o kontrahencie
    c.id AS contrahent_id,
    c.name AS contrahent_name,
    c.tax_id AS contrahent_tax_id,
    c.internal_code AS contrahent_internal_code,
    c.contact_details AS contrahent_contact_details,
    -- Status zamówienia
    os.id AS status_id,
    os.code AS status_code,
    os.display_name AS status_display_name,
    -- Informacje o wysyłkach (jako array)
    COALESCE(
        json_agg(
            json_build_object(
                'shipment_id', s.id,
                'pickup_address', s.pickup_address_snapshot,
                'delivery_address', s.delivery_address_snapshot,
                'weight', s.weight,
                'pallets_count', s.pallets_count,
                'goods_description', s.goods_description,
                'requirements', s.requirements
            )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
    ) AS shipments
FROM "ORDER" o
JOIN CONTRAHENT c ON o.contrahent_id = c.id
JOIN ORDER_STATUS os ON o.status_id = os.id
LEFT JOIN SHIPMENT s ON o.id = s.order_id
GROUP BY 
    o.id, o.customer_ref, o.created_at, o.deadline, 
    o.total_agreed_price, o.currency, o.internal_notes,
    c.id, c.name, c.tax_id, c.internal_code, c.contact_details,
    os.id, os.code, os.display_name
ORDER BY o.id;
